import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ApiService } from '../../service/api.service';
import { CreateGroupComponent } from './create-group.component';

describe('CreateGroupComponent', () => {
  const api = { createGroup: vi.fn(() => 'new-group') };
  const router = { navigate: vi.fn() };
  let component: CreateGroupComponent;

  beforeEach(() => {
    vi.clearAllMocks();
    TestBed.configureTestingModule({ providers: [
      { provide: ApiService, useValue: api }, { provide: Router, useValue: router }
    ] });
    component = TestBed.runInInjectionContext(() => new CreateGroupComponent());
  });

  it('rejects incomplete groups and groups with fewer than two members', () => {
    component.createGroup();
    component.groupForm.setValue({ name: 'Trip', members: ['Alice'], thumbnail: 'thumbnail_1.jpg' });
    component.createGroup();
    expect(api.createGroup).not.toHaveBeenCalled();
    expect(router.navigate).not.toHaveBeenCalled();
  });

  it('trims members, filters empty names and navigates to the created group', () => {
    component.groupForm.setValue({ name: 'Trip', members: [' Alice ', 'Bob', ' '], thumbnail: 'thumbnail_1.jpg' });
    component.createGroup();
    expect(api.createGroup).toHaveBeenCalledWith({
      id: '', name: 'Trip', thumbnail: 'thumbnail_1.jpg', expenses: [],
      members: [{ id: '', name: 'Alice' }, { id: '', name: 'Bob' }]
    });
    expect(router.navigate).toHaveBeenCalledWith(['/dashboard', 'new-group']);
  });

  it('adds comma-delimited members, ignores empty input and removes members', () => {
    const event = { data: ',', target: { value: ' Alice,' } };
    component.onInput(event);
    expect(component.groupForm.controls.members.value).toEqual(['Alice']);
    expect(event.target.value).toBe('');
    component.onInput({ data: ',', target: { value: ',' } });
    expect(component.groupForm.controls.members.value).toEqual(['Alice']);
    component.removeMember('Alice');
    expect(component.groupForm.controls.members.value).toEqual([]);
  });
});