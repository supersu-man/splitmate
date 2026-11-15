import { Component, effect, inject, input, model, untracked } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { MessageService } from 'primeng/api';
import { ApiService } from 'src/app/service/api.service';
import { Group, GROUP_THUMBNAILS } from 'src/app/interface/interface';

@Component({
  selector: 'app-edit-group',
  standalone: true,
  imports: [DialogModule, ButtonModule, InputTextModule, ReactiveFormsModule],
  templateUrl: './edit-group.component.html',
  styles: ``
})
export class EditGroupComponent {
  private readonly apiService = inject(ApiService);
  private readonly messageService = inject(MessageService);

  readonly visible = model<boolean>(false);
  readonly group = input<Group | null>(null);

  readonly thumbnails = GROUP_THUMBNAILS;

  readonly editForm = new FormGroup({
    name: new FormControl<string>('', {
      nonNullable: true,
      validators: [Validators.required, Validators.pattern(/^(?!\s*$).+/)]
    }),
    thumbnail: new FormControl<string>('', {
      nonNullable: true,
      validators: [Validators.required]
    })
  });

  constructor() {
    effect(() => {
      const isVisible = this.visible();
      const currentGroup = this.group();
      if (isVisible && currentGroup) {
        untracked(() => {
          this.editForm.reset({
            name: currentGroup.name,
            thumbnail: currentGroup.thumbnail || this.thumbnails[0]
          });
        });
      }
    });
  }

  selectThumbnail(thumbnail: string): void {
    this.editForm.patchValue({ thumbnail });
    this.editForm.controls.thumbnail.markAsDirty();
  }

  save(): void {
    if (this.editForm.invalid) {
      this.editForm.markAllAsTouched();
      return;
    }
    const currentGroup = this.group();
    if (!currentGroup) return;

    const val = this.editForm.getRawValue();
    const name = val.name.trim();
    const thumbnail = val.thumbnail || currentGroup.thumbnail || this.thumbnails[0];

    this.apiService.updateGroupDetails(currentGroup.id, name, thumbnail);
    this.messageService.add({
      severity: 'success',
      summary: 'Success',
      detail: 'Group details updated successfully'
    });
    this.visible.set(false);
  }

  cancel(): void {
    this.visible.set(false);
  }
}
