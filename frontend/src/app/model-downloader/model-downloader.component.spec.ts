import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModelDownloaderComponent } from './model-downloader.component';

describe('ModelDownloaderComponent', () => {
  let component: ModelDownloaderComponent;
  let fixture: ComponentFixture<ModelDownloaderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ModelDownloaderComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ModelDownloaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
