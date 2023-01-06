import {ComponentType} from "@angular/cdk/portal";
import {MatDialog, MatDialogConfig} from "@angular/material/dialog";
import {lastValueFrom} from "rxjs";

export const getOpenDialogFunc =
  <T, D, R>(component: ComponentType<T>) =>
  async (dialog: MatDialog, config?: MatDialogConfig<D>) => {
    const ref = dialog.open<T, D, R>(component, config);
    return await lastValueFrom(ref.afterClosed());
  };
