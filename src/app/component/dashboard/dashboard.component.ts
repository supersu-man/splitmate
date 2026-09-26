import { Component, inject } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { ApiService } from 'src/app/service/api.service';
import { MessageService } from 'primeng/api';
import { UtilService } from 'src/app/service/util.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [RouterModule, ButtonModule],
  templateUrl: './dashboard.component.html',
  styles: ``
})
export class DashboardComponent {

  private readonly apiService = inject(ApiService);
  private readonly utilService = inject(UtilService);
  private readonly messageService = inject(MessageService);

  readonly groups = this.apiService.groups;
  deleteGroupId: string = '';

  deleteGroupConfirmPopup(event: Event, id: string): void {
    event.stopPropagation();
    this.deleteGroupId = id;
    this.utilService.confirmDialog(
      event,
      "Delete group?",
      "Are you sure you want to delete the group?",
      this.deleteGroup
    );
  }

  private deleteGroup = (): void => {
    this.apiService.deleteGroup(this.deleteGroupId);
    this.messageService.add({ severity: 'success', summary: 'Successful', detail: 'Deleted Group' });
  };
}