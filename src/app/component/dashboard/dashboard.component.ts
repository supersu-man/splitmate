import { Component, inject, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { ApiService } from 'src/app/service/api.service';
import { MessageService } from 'primeng/api';
import { UtilService } from 'src/app/service/util.service';
import { Group } from 'src/app/interface/interface';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [RouterModule, ButtonModule],
  templateUrl: './dashboard.component.html',
  styles: ``
})
export class DashboardComponent implements OnInit {

  groups: Group[] = []
  deleteGroupId: string = ''

  apiService = inject(ApiService)
  utilService = inject(UtilService)
  messageService = inject(MessageService)

  ngOnInit(): void {
    this.getGroups()
  }

  getGroups = () => {
    this.groups = this.apiService.getGroups()
  }

  deleteGroupConfirmPopup(event: Event, id: string) {
    event.stopPropagation()
    this.deleteGroupId = id
    this.utilService.confirmDialog(
      event,
      "Delete group?",
      "Are you sure you want to delete the group?",
      this.deleteGroup
    )
  }

  private deleteGroup = () => {
    this.apiService.deleteGroup(this.deleteGroupId)
    this.getGroups()
    this.messageService.add({ severity: 'success', summary: 'Successful', detail: 'Deleted Group' })
  }

}