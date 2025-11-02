import { Component, input } from '@angular/core';

export interface ModalConfig {
  title: string;
  actions: {
    onClose?: () => void;
    onSave?: (value: any) => void;
  };
}

@Component({
  selector: 'app-modal',
  standalone: true,
  imports: [],
  templateUrl: './modal.component.html',
  styleUrl: './modal.component.scss',
})
export class ModalComponent {
  readonly modal = input<ModalConfig>();

  close() {
    this.modal()?.actions.onClose?.();
  }
}
