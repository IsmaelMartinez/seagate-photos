package main

import (
	"fmt"
	"io"
	"log"
	"net/http"
	"os"
)

func main() {
	http.HandleFunc("/upload", uploadHandler)

	//Listen on port 3001
	log.Fatal(http.ListenAndServe(":3001", nil))
}

func uploadHandler(w http.ResponseWriter, r *http.Request) {
	log.Printf(r.Method)
	switch r.Method {
	//POST takes the uploaded file(s) and saves it to disk.
	case "POST":
		//get the multipart reader for the request.
		reader, err := r.MultipartReader()

		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}

		//copy each part to destination.
		for {
			part, err := reader.NextPart()
			if err == io.EOF {
				break
			}

			//if part.FileName() is empty, skip this iteration.
			if part.FileName() == "" {
				continue
			}
			dst, err := os.Create("" + part.FileName())
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
		//display success message.
		//display(w, "upload", "Upload successful.")
	default:
		w.WriteHeader(http.StatusMethodNotAllowed)
	}
}
