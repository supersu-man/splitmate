import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { MessageService } from 'primeng/api';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { Group } from '../../interface/interface';
import { ApiService } from '../../service/api.service';
import { UtilService } from '../../service/util.service';
import { DashboardComponent } from './dashboard.component';

describe('DashboardComponent', () => {
  const group: Group = { id: 'group', name: 'Trip', thumbnail: 'thumbnail_1.jpg', members: [], expenses: [] };
  const api = { groups: signal<Group[]>([group]), deleteGroup: vi.fn() };
  const util = { confirmDialog: vi.fn() };
  const messages = { add: vi.fn() };
  let component: DashboardComponent;

  beforeEach(() => {
    vi.clearAllMocks();
    TestBed.configureTestingModule({ providers: [
      { provide: ApiService, useValue: api }, { provide: UtilService, useValue: util },
      { provide: MessageService, useValue: messages }
    ] });
    component = TestBed.runInInjectionContext(() => new DashboardComponent());
  });

  it('exposes groups and opens the edit dialog without propagating clicks', () => {
    const event = new Event('click');
    const stop = vi.spyOn(event, 'stopPropagation');
    component.openEditGroup(event, group);
    expect(stop).toHaveBeenCalledOnce();
    expect(component.groups()).toEqual([group]);
    expect(component.selectedGroupToEdit()).toBe(group);
    expect(component.editGroupDialog()).toBe(true);
  });

  it('deletes and displays a success message only after confirmation', () => {
    const event = new Event('click');
    component.deleteGroupConfirmPopup(event, group.id);
    expect(util.confirmDialog).toHaveBeenCalledWith(event, 'Delete group?', expect.any(String), expect.any(Function));
    expect(api.deleteGroup).not.toHaveBeenCalled();
    const accept = util.confirmDialog.mock.calls[0][3] as () => void;
    accept();
    expect(api.deleteGroup).toHaveBeenCalledWith(group.id);
    expect(messages.add).toHaveBeenCalledWith(expect.objectContaining({ severity: 'success' }));
  });
});