export type AddPassStatus =
  | 'added'
  | 'already_added'
  | 'cancelled'
  | 'unavailable';

export type AddPassResult = {
  status: AddPassStatus;
};
