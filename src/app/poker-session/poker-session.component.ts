import { Component, OnInit, ViewChild, ElementRef, AfterViewChecked } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { WebSocketSubject, webSocket } from 'rxjs/webSocket';
import {  FormUtils, FieldInteractionApi } from 'novo-elements';
export class Message {
  constructor(
    public sender: string,
    public content: string | number,
    public session: string,
    public type: 'points' | 'action' |'disconnect',
  ) { }
}
@Component({
  selector: 'app-poker-session',
  templateUrl: './poker-session.component.html',
  styleUrls: ['./poker-session.component.scss']
})
export class PokerSessionComponent implements OnInit, AfterViewChecked {
  public id: string;
  public name: string;
  public _webSocket: WebSocketSubject<any>; // tslint:disable-line
  public pointValues: any = {};
  public selectedPointValue: any;
  public _showValues: boolean = false; // tslint:disable-line
  public _spectator: boolean = false; // tslint:disable-line
  public options: any[] = [
    {
      label: 'S',
      value: 'S',
    },
    {
      label: 'M',
      value: 'M',
    },
    {
      label: 'L',
      value: 'L',
    },
    {
      label: 'XL',
      value: 'XL',
    },
    {
      label: '.5',
      value: .5,
    },
    {
      label: '1',
      value: 1,
    },
    {
      label: '2',
      value: 2,
    },
    {
      label: '3',
      value: 3,
    },
    {
      label: '5',
      value: 5,
    },
    {
      label: '8',
      value: 8,
    },
    {
      label: '13',
      value: 13,
    },
    {
      label: '20',
      value: 20,
    },
    {
      label: '40',
      value: 40,
    },
    {
      label: '0',
      value: 0,
      disabled: true
    },
  ];
  @ViewChild('scroller') private scroller: ElementRef;

  constructor(private route: ActivatedRoute, public formUtils: FormUtils) { }

  public ngOnInit() {
    this.id = this.route.snapshot.paramMap.get('id');
    this.name = sessionStorage.getItem('POKER_NAME');
    if (this.name) {
      this.webSocket.subscribe(this.handleSocketUpdates.bind(this));
    }
  }

  public ngAfterViewChecked() {
    this.scrollToBottom();
  }

  get webSocket(): WebSocketSubject<any> {
    if (typeof this._webSocket ===  'undefined') {
      this._webSocket = webSocket(
        `${location.protocol === 'https:' ? 'wss' : 'ws'}://${location.host.replace('4200', '4000')}/?session=${this.id}`
        );
      this._webSocket.next(new Message(this.name, undefined, this.id, 'points'));
    }
    return this._webSocket;
  }

  get userNames(): string[] {
    return Object.keys(this.pointValues);
  }

  get showValues(): boolean {
    return Object.keys(this.pointValues).filter((name: any) => {
      return !this.pointValues[name];
    }).length === 0 || this._showValues;
  }

  set showValues(value: boolean) {
    this._showValues = value;
  }

  public doShowValues(): void {
    this.showValues =  ! this._showValues;
  }

  public clearVotes(): void {
    this.showValues = false;
    this.send('ClearVotes');
  }

  get spectator(): boolean {
    return this._spectator;
  }

  set spectator(value: boolean) {
    this._spectator = value;
    this.send(value ? 'spectate' : 0);
  }

  private handleSocketUpdates(res: Message): void {
    if (res && res.sender !== 'NS') {
      switch (res.type) {
        case 'disconnect':
          delete this.pointValues[res.sender];
          break;
        case 'points':
           if (res.content === 'disconnect') {
             delete this.pointValues[res.sender];
           }
           else
           {
             this.pointValues[res.sender] = res.content;
             if (res.sender === this.name && res.content === undefined) {
               this.selectedPointValue = 0;
             }
           }
          break;
        default:
          break;
      }
    }
  }

  public send(content: string | number, type: any = 'points'): void {
    const message = new Message(this.name, content, this.id, type);
    this.webSocket.next(message);
  }


  scrollToBottom(): void {
    try {
      this.scroller.nativeElement.scrollTop = this.scroller.nativeElement.scrollHeight;
    } catch (err) { }
  }
}
