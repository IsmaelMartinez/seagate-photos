package main

import (
	"encoding/json"
	"fmt"
	"io"
	"io/ioutil"
	"log"
	"net/http"
	"os"
	"strings"
	"time"
)

func main() {
	http.HandleFunc("/upload", uploadHandler)
	http.HandleFunc("/list", listHandler)
	http.HandleFunc("/", getHandler)

	//Listen on port 3001
	log.Fatal(http.ListenAndServe(":3001", nil))
}

type FileInfo struct {
	Name    string
	Size    int64
	Mode    os.FileMode
	ModTime time.Time
	IsDir   bool
}

func getHandler(w http.ResponseWriter, r *http.Request) {
	switch r.Method {
	case "GET":
		log.Println(r.URL.Path)
		img, err := os.Open("C:\\seagate\\Photos\\" + r.URL.Path)
		if err != nil {
			log.Fatal(err) // perhaps handle this nicer
		}
		defer img.Close()
		w.Header().Set("Content-Type", "image/jpg")
		io.Copy(w, img)
	}
}

func listHandler(w http.ResponseWriter, r *http.Request) {
	switch r.Method {
	case "GET":
		w.Header().Set("Content-Type", "application/json")
		log.Printf("Get Method called")
		for k, v := range r.Form {
			log.Println(k)
			fmt.Println("key:", k)
			fmt.Println("val:", strings.Join(v, ""))
		}
		queryValues := r.URL.Query()
		pathName := queryValues.Get("pathname")
		if strings.Compare(pathName, "undefined") == 0 {

			http.Error(w, "no path provided", http.StatusInternalServerError)
			return
		}
		files, err := ioutil.ReadDir("C:\\seagate\\Photos\\" + pathName)
		if err != nil {
			log.Fatal(err)
		}

		list := []FileInfo{}

		for _, file := range files {
			f := FileInfo{
				Name:    file.Name(),
				Size:    file.Size(),
				Mode:    file.Mode(),
				ModTime: file.ModTime(),
				IsDir:   file.IsDir(),
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

			dst, err := os.Create("C:\\Seagate\\Photos\\" + pathName + "\\" + part.FileName())
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
