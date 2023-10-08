import { Overrides } from '@material-ui/core/styles/overrides';
import { StyleRules } from '@material-ui/core/styles/withStyles';
import { AnnouncementsStylePickerClassKey } from './AnnouncementsPage/AnnouncementsPage';

export type AnnouncementsNameToClassKey = {
  AnnouncementsStylePicker: AnnouncementsStylePickerClassKey;
};

export type BackstageOverrides = Overrides & {
  [Name in keyof AnnouncementsNameToClassKey]?: Partial<
    StyleRules<AnnouncementsNameToClassKey[Name]>
  >;
};
