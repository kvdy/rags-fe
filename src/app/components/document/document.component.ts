import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from 'src/app/services/auth.service';

interface Directory {
  id: number;
  created: string;
  updated: string;
  name: string;
  status: string;
}
interface Document {
    id: number;
    created: string;
    updated: string;
    title: string;
    filepath: string;
    directory: string;
    ownerid: string;
    status: string;
}

interface DirectoryPayload {
  directory: string;
  status: string;
}

interface DocumentPayload {
  title: string;
  filepath: string;
  ownerid: string;
  status: string;
  directory: string;
}

@Component({
  selector: 'app-document',
  templateUrl: './document.component.html',
  styleUrls: ['./document.component.css']
})
export class DocumentComponent implements OnInit {
  private apiUrl = 'http://localhost:3000/documents';
  private uploadUrl = 'http://localhost:8000/upload';
  private ingestUrl = 'http://127.0.0.1:8000/ingest/';
  private directoryUrl = "http://localhost:3000/directories";
  
  documents: Document[] = [];
  directories: Directory[] = [];
  distinctDirectories: Directory[] = [];
  isModalOpen = false;
  isUploadModalOpen = false;
  editingDocument: Document | null = null;
  selectedFile: File | null = null;
  directory: string = '';
  title: string = '';

  newDocument = {
    title: '',
    filepath: '',
    directory: '',
    ownerid: '',
    status: '',
  };

  newDirectory = {
    directory: '',
    status: '',
  };
  
  constructor(private http: HttpClient, private authService: AuthService) {}

  ngOnInit(): void {
    this.getAllDocuments();
    this.getAllDirectories();
  }

  private getHeaders(): HttpHeaders {
    const authToken = localStorage.getItem('authToken') || '';
    return new HttpHeaders({
      'Authorization': `Bearer ${authToken}`,
      'Content-Type': 'application/json'
    });
  }

  getAllDocuments(): void {
    this.http.get<Document[]>(this.apiUrl, { headers: this.getHeaders() })
      .subscribe(data => {
        this.documents = data;
      });
  }

  getAllDirectories(): void {
    this.http.get<Directory[]>(this.directoryUrl, { headers: this.getHeaders() })
      .subscribe(data => {
        this.distinctDirectories = data;
        console.log("Distinct Directories:", this.distinctDirectories);
      });
  }

  updateDirectoryStatus(directory: Directory): void {
    this.http.put(`${this.directoryUrl}/${directory.id}`, directory, { headers: this.getHeaders() })
        .subscribe(() => this.getAllDirectories());
  }

  updateDocumentStatus(directory: string, status: string): void {
    this.documents
      .filter(doc => doc.directory === directory)
      .forEach(doc => {
        const updatedDoc = { ...doc, status };
        this.http.put(`${this.apiUrl}/${doc.id}`, updatedDoc, { headers: this.getHeaders() })
          .subscribe();
      });
  }

  ingestDirectory(directory: Directory): void {
    let ingestionStatus = 'STARTED';
    directory.status = ingestionStatus;
    this.updateDirectoryStatus(directory);
    const payload = { directory: directory.name };
    this.http.post(this.ingestUrl, payload, { headers: this.getHeaders() })
      .subscribe(response => {
        console.log(`Ingest triggered for directory: ${directory.name}`, response);
        ingestionStatus = 'COMPLETED';
        directory.status = ingestionStatus;
        this.updateDirectoryStatus(directory);
        this.getAllDirectories();
      }, error => {
        console.error(`Error ingesting directory: ${directory.name}`, error);
        ingestionStatus = 'FAILED';
        directory.status = ingestionStatus;
        this.updateDirectoryStatus(directory);
        this.getAllDirectories();
      });
  }

  deleteDocument(id?: number): void {
    if (id === undefined) return;
    this.http.delete<void>(`${this.apiUrl}/${id}`, { headers: this.getHeaders() })
      .subscribe(() => this.getAllDocuments());
  }

  openUploadModal(): void {
    this.isUploadModalOpen = true;
  }

  closeUploadModal(): void {
    this.isUploadModalOpen = false;
  }

  handleFileInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFile = input.files[0];
    }
  }


  addDirectory(): void {
    const newDirectoryPayload = {
      name: this.newDirectory.directory,
      status: this.newDirectory.status,
    };

    this.http.post<Directory>(this.directoryUrl, newDirectoryPayload, { headers: this.getHeaders() })
      .subscribe(() => this.getAllDirectories());
  }
  addDocument(): void {
    const newDocumentPayload = {
      title: this.newDocument.title,
      filepath: this.newDocument.filepath,
      ownerid: this.newDocument.ownerid,
      status: this.newDocument.status,
      directory: this.newDocument.directory,
    };

    this.http.post<Document>(this.apiUrl, newDocumentPayload, { headers: this.getHeaders() })
      .subscribe(() => this.getAllDocuments());
  }

  uploadDocument(): void {
    if (!this.selectedFile) {
        console.error("No file selected for upload.");
        return;
    }

    const formData = new FormData();
    formData.append('file', this.selectedFile);
    formData.append('directory', this.directory || 'uploaded_docs');

    console.log("Uploading file:", this.selectedFile.name, "to directory:", this.directory || 'uploaded_docs');

    this.http.post(this.uploadUrl, formData) // 🚨 Remove headers to let the browser set it
      .subscribe({
        next: (response) => {
          console.log("File uploaded successfully:", response);

          // Set document metadata
          this.newDocument.title = this.title || 'Untitled';
          if(this.selectedFile)
          this.newDocument.filepath = this.selectedFile.name || 'Untitled';
          this.newDocument.directory = this.directory || 'uploaded_docs';
          this.newDocument.ownerid = this.authService.getUsername() || 'UNKNOWN';
          this.newDocument.status = 'UPLOADED';

          // Ensure newDirectory exists before assignment
          if (!this.newDirectory) {
              this.newDirectory = { directory: '', status: '' };
          }
          this.newDirectory.directory = this.newDocument.directory;
          this.newDirectory.status = 'NOT_STARTED';

          this.addDocument();
          this.addDirectory();
          this.getAllDocuments();
          this.getAllDirectories();
          this.closeUploadModal();
        },
        error: (error) => {
          console.error("Error uploading file:", error);
        }
      });
}

//   uploadDocument(): void {
//     if (!this.selectedFile) return;

//     const formData = new FormData();
//     formData.append('file', this.selectedFile);
//     formData.append('directory', this.directory || 'uploaded_docs');
//     this.newDirectory.directory = this.directory || 'uploaded_docs';

//     this.http.post(this.uploadUrl, formData, { headers: this.getHeaders() })
//       .subscribe(() => {
//         if(this.title){
//             this.newDocument.title = this.title;
//         }
//         if(this.selectedFile){
//             this.newDocument.filepath = this.selectedFile.name;
//         }
//         if(this.directory){
//             this.newDocument.directory = this.directory;
//         } else {
//             this.newDocument.directory = "uploaded_docs";
//         }
//         if(this.authService.getUsername()){
//             this.newDocument.ownerid = this.authService.getUsername() || 'UNKNOWN';
//         }
//         this.newDocument.status = 'UPLOADED';

//         this.newDirectory.status = 'NOT_STARTED';

//         this.addDocument();
//         this.getAllDocuments();
//         this.closeUploadModal();
//       });
//   }

}


// import { Component, OnInit } from '@angular/core';
// import { HttpClient, HttpHeaders } from '@angular/common/http';
// import { Observable } from 'rxjs';
// import { AuthService } from 'src/app/services/auth.service';

// interface Document {
//     id: number;
//     created: string;
//     updated: string;
//     title: string;
//     filepath: string;
//     directory: string;
//     ownerid: string;
//     status: string;
// }

// interface DocumentPayload {
//   title: string;
//   filepath: string;
//   ownerid: string;
//   status: string;
//   directory: string;
// }

// @Component({
//   selector: 'app-document',
//   templateUrl: './document.component.html',
//   styleUrls: ['./document.component.css']
// })
// export class DocumentComponent implements OnInit {
//   private apiUrl = 'http://localhost:3000/documents';
//   private uploadUrl = 'http://localhost:8000/upload';
//   private ingestUrl = "http://localhost:8000/ingest";
//   documents: Document[] = [];
//   distinctDirectories: string[] = [];
//   isModalOpen = false;
//   isUploadModalOpen = false;
//   editingDocument: Document | null = null;
//   selectedFile: File | null = null;
//   directory: string = '';
//   title: string = '';

//   newDocument = {
//     title: '',
//     filepath: '',
//     directory: '',
//     ownerid: '',
//     status: '',
// };
//   constructor(private http: HttpClient, private authService: AuthService) {}

//   ngOnInit(): void {
//     this.getAllDocuments();
//   }

//   private getHeaders(): HttpHeaders {
//     const authToken = localStorage.getItem('authToken') || '';
//     return new HttpHeaders({
//       'Authorization': `Bearer ${authToken}`
//     });
//   }

//   getAllDocuments(): void {
//     this.http.get<Document[]>(this.apiUrl, { headers: this.getHeaders() })
//       .subscribe(data => {
//         this.documents = data;
//         this.extractDistinctDirectories();
//   }

//   extractDistinctDirectories(): void {
//     this.distinctDirectories = [...new Set(this.documents.map(doc => doc.directory))];

//   }

//   getDocumentById(id: number): Observable<Document> {
//     return this.http.get<Document>(`${this.apiUrl}/${id}`, { headers: this.getHeaders() });
//   }

//   createDocument(newDocument: DocumentPayload): Observable<Document> {
//     return this.http.post<Document>(this.apiUrl, newDocument, { headers: this.getHeaders() });
//   }

//   updateDocument(id: number, updatedDocument: Document): Observable<Document> {
//     return this.http.put<Document>(`${this.apiUrl}/${id}`, updatedDocument, { headers: this.getHeaders() });
//   }

//   deleteDocument(id?: number): void {
//     if (id === undefined) return;
//     this.http.delete<void>(`${this.apiUrl}/${id}`, { headers: this.getHeaders() })
//       .subscribe(() => this.getAllDocuments());
//   }

//   openModal(document?: Document): void {
//     this.isModalOpen = true;
//     if (document) {
//       this.editingDocument = document;
//     //   this.newDocument = { ...document };
//     } else {
//       this.editingDocument = null;
//     //   this.newDocument = { title: '', filepath: '', ownerid: '', status: ''};
//     }
//   }

//   closeModal(): void {
//     this.isModalOpen = false;
//   }

//   addDocument(): void {
//     const newDocumentPayload = {
//       title: this.newDocument.title,
//       filepath: this.newDocument.filepath,
//       ownerid: this.newDocument.ownerid,
//       status: this.newDocument.status,
//       directory: this.newDocument.directory,
//     };

//     this.createDocument(newDocumentPayload).subscribe(() => {
//         this.getAllDocuments();
//     //   this.closeModal();
//     });
//   }

// //   saveDocument(): void {
// //     if (this.editingDocument && this.editingDocument.id !== undefined) {
// //       this.updateDocument(this.editingDocument.id, this.newDocument).subscribe(() => {
// //         this.getAllDocuments();
// //         this.closeModal();
// //       });
// //     } else {
// //       this.addDocument();
// //     }
// //   }

//   openUploadModal(): void {
//     this.isUploadModalOpen = true;
//   }

//   closeUploadModal(): void {
//     this.isUploadModalOpen = false;
//   }

//   handleFileInput(event: Event): void {
//     const input = event.target as HTMLInputElement;
//     if (input.files && input.files.length > 0) {
//       this.selectedFile = input.files[0];
//     }
//   }

//   uploadDocument(): void {
//     if (!this.selectedFile) return;

//     const formData = new FormData();
//     formData.append('file', this.selectedFile);
//     formData.append('directory', this.directory);
//     console.log(this.directory + "::" + this.title);
//     this.http.post(this.uploadUrl, formData, { headers: this.getHeaders() })
//       .subscribe(() => {
//         console.log(this.directory + "::" + formData.get('directory'));
//         if (this.title) {
//           this.newDocument.title = this.title;
//         }
//         if (this.selectedFile) {
//           this.newDocument.filepath = this.selectedFile.name;
//         }
//         if (this.directory) {
//           this.newDocument.directory = this.directory;
//         } else {
//             this.newDocument.directory = "uploaded_docs";
//         }
//         if (this.authService.getUsername()) {
//           this.newDocument.ownerid = this.authService.getUsername() || 'UNKNOWN';
//         }
//           this.newDocument.status = 'Uploaded';
//         if (this.selectedFile) {
//           this.newDocument.filepath = this.selectedFile.name;
//         }
//         if (this.authService.getUsername()) {
//           this.newDocument.ownerid = this.authService.getUsername() || 'UNKNOWN';
//         }
//         this.newDocument.status = 'Uploaded';
//         this.addDocument();
//         this.getAllDocuments();
//         this.closeUploadModal();
//       });
//   }
// }

// // import { Component, OnInit } from '@angular/core';
// // import { HttpClient, HttpHeaders } from '@angular/common/http';
// // import { Observable } from 'rxjs';

// // interface Document {
// //   id?: number;
// //   title: string;
// //   content: string;
// // }

// // @Component({
// //   selector: 'app-document',
// //   templateUrl: './document.component.html',
// //   styleUrls: ['./document.component.css']
// // })
// // export class DocumentComponent implements OnInit {
// //   private apiUrl = 'http://localhost:3000/documents';
// //   documents: Document[] = [];
// //   isModalOpen = false;
// //   editingDocument: Document | null = null;
// //   newDocument: Document = { title: '', content: '' };

// //   constructor(private http: HttpClient) {}

// //   ngOnInit(): void {
// //     this.getAllDocuments();
// //   }

// //   private getHeaders(): HttpHeaders {
// //     const authToken = localStorage.getItem('authToken') || '';
// //     return new HttpHeaders({
// //       'Authorization': `Bearer ${authToken}`,
// //       'Content-Type': 'application/json'
// //     });
// //   }

// //   getAllDocuments(): void {
// //     this.http.get<Document[]>(this.apiUrl, { headers: this.getHeaders() })
// //       .subscribe(data => this.documents = data);
// //   }

// //   getDocumentById(id: number): Observable<Document> {
// //     return this.http.get<Document>(`${this.apiUrl}/${id}`, { headers: this.getHeaders() });
// //   }

// //   createDocument(newDocument: Document): Observable<Document> {
// //     return this.http.post<Document>(this.apiUrl, newDocument, { headers: this.getHeaders() });
// //   }

// //   updateDocument(id: number, updatedDocument: Document): Observable<Document> {
// //     return this.http.put<Document>(`${this.apiUrl}/${id}`, updatedDocument, { headers: this.getHeaders() });
// //   }

// //   deleteDocument(id?: number): void {
// //     if (id === undefined) return;
// //     this.http.delete<void>(`${this.apiUrl}/${id}`, { headers: this.getHeaders() })
// //       .subscribe(() => this.getAllDocuments());
// //   }

// //   openModal(document?: Document): void {
// //     this.isModalOpen = true;
// //     if (document) {
// //       this.editingDocument = document;
// //       this.newDocument = { ...document };
// //     } else {
// //       this.editingDocument = null;
// //       this.newDocument = { title: '', content: '' };
// //     }
// //   }

// //   closeModal(): void {
// //     this.isModalOpen = false;
// //   }

// //   addDocument(): void {
// //     this.createDocument(this.newDocument).subscribe(() => {
// //       this.getAllDocuments();
// //       this.closeModal();
// //     });
// //   }


// //   saveDocument(): void {
// //     if (this.editingDocument && this.editingDocument.id !== undefined) {
// //       this.updateDocument(this.editingDocument.id, this.newDocument).subscribe(() => {
// //         this.getAllDocuments();
// //         this.closeModal();
// //       });
// //     } else {
// //       this.addDocument();
// //     }
// //   }
// // }
