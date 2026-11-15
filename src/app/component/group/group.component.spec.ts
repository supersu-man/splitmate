import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { Group } from '../../interface/interface';
import { ApiService } from '../../service/api.service';
import { UtilService } from '../../service/util.service';
import { GroupComponent } from './group.component';

describe('GroupComponent', () => {
  const group: Group = {
    id: 'group', name: 'Trip', thumbnail: 'thumbnail_1.jpg', expenses: [],
    members: [{ id: 'alice', name: 'Alice' }, { id: 'bob', name: 'Bob' }]
  };
  const api = {
    groups: signal<Group[]>([group]), updateMemberName: vi.fn(), deleteExpense: vi.fn(), duplicateGroup: vi.fn(() => 'copy'),
    computeSettlements: vi.fn(() => [{ from: 'bob', to: 'alice', amount: 15 }])
  };
  const util = { confirmDialog: vi.fn() };
  const router = { navigate: vi.fn() };
  let fixture: ComponentFixture<GroupComponent>;
  let component: GroupComponent;

  beforeEach(async () => {
    vi.clearAllMocks();
    api.groups.set([group]);
    await TestBed.configureTestingModule({ imports: [GroupComponent], providers: [
      { provide: ApiService, useValue: api }, { provide: UtilService, useValue: util }, { provide: Router, useValue: router }
    ] }).overrideComponent(GroupComponent, { set: { template: '', imports: [] } }).compileComponents();
    fixture = TestBed.createComponent(GroupComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('groupId', 'group');
    fixture.detectChanges();
  });

  it('looks up the group and resolves settlement member names reactively', () => {
    expect(component.group()).toBe(group);
    expect(component.memberMap()).toEqual({ alice: 'Alice', bob: 'Bob' });
    expect(component.settlements()).toEqual([{ from: 'Bob', to: 'Alice', amount: 15 }]);
    api.groups.set([]);
    expect(component.group()).toBeUndefined();
    expect(component.memberMap()).toEqual({});
    expect(component.settlements()).toEqual([]);
  });

  it('rejects invalid members and saves valid member edits', () => {
    component.saveMember();
    expect(api.updateMemberName).not.toHaveBeenCalled();
    component.openEditMember('bob', 'Bob');
    expect(component.memberDialog()).toBe(true);
    component.memberForm.controls.name.setValue('Robert');
    component.saveMember();
    expect(api.updateMemberName).toHaveBeenCalledWith('Robert', 'group', 'bob');
    expect(component.memberDialog()).toBe(false);
    component.openEditGroup();
    expect(component.editGroupDialog()).toBe(true);
  });

  it('deletes an expense only after accepting confirmation', () => {
    component.deleteExpenseConfirmPopup(new Event('click'), 'expense');
    expect(api.deleteExpense).not.toHaveBeenCalled();
    const accept = util.confirmDialog.mock.calls[0][3] as () => void;
    accept();
    expect(api.deleteExpense).toHaveBeenCalledWith('expense', 'group');
  });

  it('creates a group copy and navigates to it', () => {
    component.duplicateGroup();
    expect(api.duplicateGroup).toHaveBeenCalledWith('group');
    expect(router.navigate).toHaveBeenCalledWith(['/dashboard', 'copy']);
  });
});