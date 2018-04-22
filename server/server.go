package main

import (
	"encoding/json"
	"fmt"
	"io"
	"io/ioutil"
	"log"
	"mime"
	"net/http"
	"os"
	"strings"
	"time"

	"github.com/boltdb/bolt"
)

const photosPath = "//192.168.5.8/Seagate/Photos/"

func main() {
	http.HandleFunc("/upload", uploadHandler)
	http.HandleFunc("/list", listHandler)
	http.HandleFunc("/", getHandler)

	openDB()
	//Listen on port 3001
	log.Fatal(http.ListenAndServe(":3001", nil))
}

func openDB() {
	db, err := bolt.Open(photosPath+"photos.db", 0600, &bolt.Options{Timeout: 1 * time.Second})
	if err != nil {
		log.Fatal(err)
	}
	defer db.Close()
}

type FileInfo struct {
	Name        string
	Size        int64
	Mode        os.FileMode
	ModTime     time.Time
	IsDir       bool
	ContentType string
}

func getHandler(w http.ResponseWriter, r *http.Request) {
	switch r.Method {
	case "GET":
		log.Println(r.URL.Path)
		file, err := os.Open(photosPath + r.URL.Path)
		if err != nil {
			log.Fatal(err)
		}
		log.Println(mime.TypeByExtension("." + strings.Split(file.Name(), ".")[1]))
		// buffer := make([]byte, 512)
		// _, err = file.Read(buffer)
		// if err != nil {
		// 	log.Fatal(err)
		// }
		// contentType := http.DetectContentType(buffer)
		// log.Println(contentType)
		defer file.Close()
		w.Header().Set("Content-Type", mime.TypeByExtension("."+strings.Split(file.Name(), ".")[1]))
		io.Copy(w, file)
	}
}

func listHandler(w http.ResponseWriter, r *http.Request) {
	switch r.Method {
	case "GET":
		w.Header().Set("Content-Type", "application/json")
		log.Printf("Get Method called")
		queryValues := r.URL.Query()
		pathName := queryValues.Get("pathname")
		log.Println(pathName)
		if strings.Compare(pathName, "undefined") == 0 {

			http.Error(w, "no path provided", http.StatusInternalServerError)
			return
		}
		files, err := ioutil.ReadDir((photosPath + pathName))
		if err != nil {
			log.Fatal(err)
		}

		list := []FileInfo{}

		for _, file := range files {
			log.Println("reading file", file.Name())
			contentType := "folder"
			if !file.IsDir() {
				openFile, err := os.Open(photosPath + pathName + "/" + file.Name())
				if err != nil {
					log.Fatal(err)
				}
				defer openFile.Close()
				buffer := make([]byte, 512)
				_, err = openFile.Read(buffer)
				if err != nil {
					log.Fatal(err)
				}
				contentType = http.DetectContentType(buffer)
			}

			f := FileInfo{
				Name:        file.Name(),
				Size:        file.Size(),
				Mode:        file.Mode(),
				ModTime:     file.ModTime(),
				IsDir:       file.IsDir(),
				ContentType: contentType,
			}
			list = append(list, f)
		}
		output, err := json.Marshal(list)
		if err != nil {
			log.Fatal(err)
		}
		log.Println(string(output))
		w.Write(output)
	default:
		w.WriteHeader(http.StatusMethodNotAllowed)
	}
}

func uploadHandler(w http.ResponseWriter, r *http.Request) {
	switch r.Method {
	case "POST":
		reader, err := r.MultipartReader()
		log.Printf("POST upload Method called")
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		queryValues := r.URL.Query()
		pathName := queryValues.Get("pathname")

		log.Println(pathName)
		if strings.Compare(pathName, "undefined") == 0 {

			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		for {
			part, err := reader.NextPart()
			if err == io.EOF {
				break
			}

			if part.FileName() == "" {
				continue
			}

			dst, err := os.Create(photosPath + pathName + "/" + part.FileName())
			defer dst.Close()

			if err != nil {
				http.Error(w, err.Error(), http.StatusInternalServerError)
				return
			}

			if _, err := io.Copy(dst, part); err != nil {
				http.Error(w, err.Error(), http.StatusInternalServerError)
				return
			}
		}
		fmt.Fprintf(w, "OK")
	default:
		w.WriteHeader(http.StatusMethodNotAllowed)
	}
}
