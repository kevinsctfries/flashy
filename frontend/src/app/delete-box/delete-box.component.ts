import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-delete-box',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './delete-box.component.html',
  styleUrls: ['./delete-box.component.scss'],
})
export class DeleteBoxComponent {
  @Input() isOpen = false;
  @Output() confirm = new EventEmitter<void>();
  @Output() cancelDelete = new EventEmitter<void>();

  onConfirm() {
    this.confirm.emit();
  }

  onCancel() {
    this.cancelDelete.emit();
  }
}
