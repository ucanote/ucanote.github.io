import { Component, ElementRef, EventEmitter, HostListener, Input, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { ConfirmationService, MenuItem, MessageService } from 'primeng/api';
import { ContextMenu } from 'primeng/contextmenu';
import { Subscription } from 'rxjs';
import { GroupListScrollService } from '../group-list/group-list-scroll.service';
import { HeaderObserverService } from '../header/header-observer.service';
import { HeaderService } from '../header/header.service';

@Component({
  selector: 'group',
  templateUrl: './group.component.html',
  styleUrls: ['./group.component.scss'],
  providers: [ConfirmationService, MessageService]
})
export class GroupComponent implements OnInit, OnDestroy {
  @Input()
  model: GroupModel | undefined;

  @ViewChild("outer")
  box: ElementRef | undefined;

  @Output("groupClick")
  clickEmitter = new EventEmitter();
  @Output("groupDeleteClick")
  groupDeleteEmitter = new EventEmitter();

  @ViewChild("menu")
  menu: ContextMenu | undefined;

  scrollObserver?: Subscription;

  subscriptions: Subscription[] = [];

  constructor(private hostElementRef: ElementRef, private confirmationService: ConfirmationService, private headerService: HeaderService,
    private headerObserver: HeaderObserverService,
    private groupListScrollService: GroupListScrollService) {
    }

  ngOnInit(): void {

    let s1 = this.headerObserver.groupRenameUpdatedObservable.subscribe(({groupId, newName}) => {
      if(this.model?.id == groupId)
        this.model.name = newName;
    });
    this.subscriptions.push(s1);
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((s) => s.unsubscribe());
  }

  @HostListener('click', ['$event'])
  onClick() {
    if (this.model) {
      this.clickEmitter.emit(this.model);
    }
  }

  contextMenuItems: MenuItem[] = [
    {
      label: '명칭 변경',
      command: (event) => { this.onGroupRenameClick(event) }
    },
    {
      label: '그룹 삭제',
      command: (event) => { this.onGroupDeleteClick(event) }
    }];

  onGroupRenameClick(event: any) {
    const hostElement = this.hostElementRef?.nativeElement;
    if (!hostElement)
      return;
    (event.originalEvent as Event).stopPropagation();
    if (this.model)
      this.headerService.requestToRenameGroup(this.model.id, this.model.name);
  }

  onGroupDeleteClick(event: any) {
    const hostElement = this.hostElementRef?.nativeElement;
    if (!hostElement)
      return;
    (event.originalEvent as Event).stopPropagation();
    this.confirmationService.confirm({
      target: hostElement,
      message: '정말로 삭제하시겠습니까?',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.groupDeleteEmitter.emit(this.model);
      },
      reject: () => {
        //reject action
      }
    });
  }

  onShow(){    
    this.scrollObserver?.unsubscribe();
    this.scrollObserver = this.groupListScrollService.scrollObservable.subscribe((top) => {
          this.menu?.hide();
    });
  }

  onHide(){
    this.scrollObserver?.unsubscribe();
    this.scrollObserver = undefined;
  }
}

export interface GroupModel extends _Types.GroupsResponse.RootObject {
  itemCount?: number;
  disabled?: boolean
};