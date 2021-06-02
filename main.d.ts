export type LocaleSettings = {
  sets: Array<string>,
  dir: string,
  use: null | string
};

export enum MODE {
  OPTIONAL = 'optional',
  REQUIRED = 'required'
};

export type OptionItem = {
  name: string
  short: string | null
  mode: MODE
  desc: string
};

export type ArgumentItem = {
  name: string
  mode: MODE
  desc: string
};

export type AppSettings = {
  name: string
  version: string
  desc: string
  commands_dir: string
  commands_sort: Array<string>
  locale: LocaleSettings
  options: Array<OptionItem>
};

export declare class App {
  config: AppSettings;
  opts: Array<OptionItem>
  commands: Record<string, Command>
  construct(settings: AppSettings);
  addGlobalOption(
    name: string,
    short: string,
    desc: string,
    mode: MODE,
    _default: any | null
  ): this;
  locale(options: LocaleSettings);
  register(cmd: any);
  start(options: AppSettings): Promise<void>;
  exec(name: string, argvSlice: number[]): Promise<void>;
};

export type CommandSettings = {
  name: string,
  alias: Array<string>,
  desc: string,
  args: Array<ArgumentItem>,
  options: Array<OptionItem>,
};

export declare class Command {
  config: CommandSettings
  args: Array<ArgumentItem>
  opts: Array<OptionItem>
  construct(config: CommandSettings);
  addArgument(name: string, desc: string, default_value: any | null): this;
  addOption(name: string, short: string, desc: string, default_value: any | null): this;
  usage(): void;
  exec(): Promise<void>;
  ask(message: string, default_value: any | null): Promise<string>;
  confirm(message: string, default_value: boolean): Promise<boolean>;
  select(message: string, choices: Array<string>, default_choice: any | null): Promise<string>;
  table(rows: Array<Array<string>>, headers: Array<string>): Promise<void>;
};

export type Step = {
  workflow: string
  start: number
  end: number | null
  success: boolean | null
  error: Error | null
};

export type Context = {
  workflows: Array<string>
  curr: IStep | null
  steps: Record<string, IStep>
  success: boolean | null
};

export declare class Workflow {
  operator: Record<string, (context: Context) => void | string>
  workflows: Array<string>
  construct(operator: Record<string, (context: Context) => void | string>, workflows: Array<string>);
  dispatch(context: Context, curr: string): Promise<void>;
  start(context: Context): Promise<Context>;
};
