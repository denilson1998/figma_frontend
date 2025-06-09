import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class IAService {

  constructor(private http: HttpClient) 
  { 

  }

  analyzeSketch(imageFile: File): Observable<{ components: any[] }> {
    const formData = new FormData();
    formData.append('file', imageFile);
    return this.http.post<{ components: any[] }>('https://localhost:7243/api/IAGeneration/analyze', formData);
  }
}
