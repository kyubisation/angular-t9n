import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';

@Component({
  selector: 't9n-source-orphans',
  templateUrl: './source-orphans.component.html',
  styleUrls: ['./source-orphans.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SourceOrphansComponent implements OnInit {
  constructor() {}

  ngOnInit(): void {}
}
