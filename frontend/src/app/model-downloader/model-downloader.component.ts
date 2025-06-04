import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ModelService, ModelProgress } from '../services/model.service';

@Component({
  selector: 'app-model-downloader',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatProgressSpinnerModule],
  templateUrl: './model-downloader.component.html',
  styleUrls: ['./model-downloader.component.scss'],
})
export class ModelDownloaderComponent implements OnInit {
  showDialog = false;
  downloading = false;
  errorMessage: string | null = null;
  modelStatus = false;

  constructor(private modelService: ModelService) {}

  ngOnInit() {
    this.checkModelStatus();
  }

  private checkModelStatus() {
    this.modelService.checkModelStatus().subscribe({
      next: (response) => {
        this.modelStatus = response.downloaded;
      },
      error: (error) => {
        console.error('Error checking model status:', error);
        this.errorMessage = 'Error checking model status';
      },
    });
  }

  private checkDownloadProgress() {
    if (!this.downloading) return;

    const interval = setInterval(() => {
      this.modelService.getProgress().subscribe({
        next: (progress: ModelProgress) => {
          if (progress.status === 'complete') {
            this.downloading = false;
            this.showDialog = false;
            clearInterval(interval);
          } else if (progress.status === 'error') {
            this.downloading = false;
            clearInterval(interval);
            this.errorMessage = progress.error_message || 'Download failed';
          }
        },
        error: (error) => {
          console.error('Error checking progress:', error);
          this.downloading = false;
          clearInterval(interval);
          this.errorMessage = 'Error checking download progress';
        },
      });
    }, 1000);
  }

  startDownload(token?: string) {
    if (this.downloading) return;

    this.downloading = true;
    this.errorMessage = null;

    this.modelService.downloadModel(token).subscribe({
      next: (response) => {
        console.log('Download started successfully:', response);
        this.checkDownloadProgress();
      },
      error: (error) => {
        this.downloading = false;
        if (error.status === 401 && error.error?.requires_token) {
          const token = prompt('Please enter your HuggingFace access token:');
          if (token) {
            this.startDownload(token);
          } else {
            this.errorMessage = 'Token required to download model';
          }
        } else {
          this.errorMessage = error.error?.error || 'Download failed';
        }
      },
    });
  }

  cancel() {
    if (this.downloading) {
      this.modelService.cancelDownload().subscribe({
        next: (response) => {
          console.log('Cancel request sent:', response);
          this.downloading = false;
          this.showDialog = false;
        },
        error: (error) => {
          console.error('Error canceling download:', error);
          this.errorMessage = 'Failed to cancel download';
        },
      });
    } else {
      this.showDialog = false;
    }
  }

  public openDialog() {
    if (!this.modelStatus) {
      this.showDialog = true;
      this.downloading = false;
      this.errorMessage = null;
    }
  }
}
