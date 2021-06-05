import { Color } from 'colors';
import { ChildProcess } from 'child_process';

type Level = number | null | boolean | string;
type ObjectItem = Record<string, unknown>;

type LocaleSettings = {
  sets: Array<string>,
  dir: string,
  use?: string
};

declare enum MODE {
  OPTIONAL = 'optional',
  REQUIRED = 'required'
}

type OptionItem = {
  name: string
  short?: string
  mode?: MODE
  desc?: string
};

type ArgumentItem = {
  name: string
  mode?: MODE
  desc?: string
};

type AppSettings = {
  name: string
  version: string
  desc?: string
  commands_dir?: string
  commands_sort?: Array<string>
  locale?: LocaleSettings
  options?: Array<OptionItem>
};

export declare class App {
  config: AppSettings;
  opts?: Array<OptionItem>
  commands: Record<string, Command>
  constructor(settings?: AppSettings);
  addGlobalOption(
    name: string,
    short?: string,
    desc?: string,
    mode?: MODE,
    _default?: any
  ): this;
  locale(options?: LocaleSettings);
  register(cmd: any);
  start(options?: AppSettings): Promise<void>;
  exec(name: string, argvSlice?: number[]): Promise<void>;
}

type CommandSettings = {
  name: string,
  alias?: Array<string>,
  desc?: string,
  args?: Array<ArgumentItem>,
  options?: Array<OptionItem>,
};

export declare abstract class Command {
  config: CommandSettings
  args?: Array<ArgumentItem>
  opts?: Array<OptionItem>
  constructor(config?: CommandSettings);
  addArgument(name: string, desc?: string, default_value?: any): this;
  addOption(name: string, short?: string, desc?: string, default_value?: any): this;
  usage(): void;
  abstract exec(): Promise<void>;
  ask(message: string, default_value?: any): Promise<string>;
  confirm(message: string, default_value?: boolean): Promise<boolean>;
  select(message: string, choices: Array<string>, default_choice?: any): Promise<string>;
  table(rows: Array<Array<string>>, headers?: Array<string>): Promise<void>;
}

type Step = {
  workflow?: string
  start?: number
  end?: number
  success?: boolean
  error?: Error
};

type Context = {
  workflows?: Array<string>
  curr?: Step
  steps?: Record<string, Step>
  success?: boolean
};

export declare class Workflow {
  operator: Record<string, (context: Context) => void | string>
  workflows: Array<string>
  constructor(operator: Record<string, (context: Context) => Promise<void | string>>, workflows?: Array<string>);
  dispatch(context: Context, curr: string): Promise<void>;
  start(context: Context): Promise<Context>;
}

export declare class Configuration {
  [key: string]: any
  constructor(config?: ObjectItem, sep?: string);
  init(config?: ObjectItem, sep?: string);
  assign(config: ObjectItem);
  get(key?: string, _default?: any);
  validate(keys?: Array<string> | string);
}

interface Debug {
  dump(...data: any[]): void;
  halt(...data: any[]): void;
  jump(jumpNumber?: number, ...data: any[]): void;
  stack(...data: any[]): void;
  warning(...data: any[]): void;
  pause(...data: any[]): Promise<void>;
  error(...data: any[]): void;
}

export const debug: Debug;

interface Locales {
  restore(): void;
  init(config?: Record<string, any>): void;
  __(str: string, params?: Record<string, string>): string;
  use(set: string): void;
}

export const locales: Locales;

interface Printer {
  colors: Color
  fixed(content: string, length?: number, fillPosition?: string, fill?: string): this;
  themes(options?: Record<string, string>): Record<string, string>;
  println(str?: string): this;
  print(str?: string): this;
  enable(): this;
  disable(): this;

  input(str?: string): this;
  verbose(str?: string): this;
  info(str?: string): this;
  data(str?: string): this;
  debug(str?: string): this;

  yellow(str?: string): this;
  green(str?: string): this;
  red(str?: string): this;

  warning(...str: string[]): this;
  success(...str: string[]): this;
  error(...str: string[]): this;
}

export const printer: Printer

export namespace helper {
  module fs {
    function _ext(filename?: string): string;
    function _write(filepath: string, content: string): Promise<void>;
    function _append(filepath: string, content: string): Promise<void>;
    function _read(filepath: string): Promise<string>;
    function _read_json(filepath: string): Promise<string>;
    function _mkdir(dir: string): Promise<void>;
    function _exists(filepath: string): Promise<boolean>;
    function _move(source: string, target: string): Promise<void>;
    function _is_file(filepath: string): Promise<boolean>;
    function _is_dir(dirpath: string): Promise<boolean>;
    function _copy(source: string, target: string, recur?: boolean): Promise<void>;
    function _search(dir: string, ext?: string, recur?: boolean): Promise<Array<string>>;
    function _list(dir: string, full?: boolean, ext?: string): Promise<Array<string>>;
    function _remove(filepath: string, recur?: boolean): Promise<void>;
  }

  module cmd {
    function _shell(cmd: string, cwd?: string | null, print?: boolean, throw_error?: boolean): Promise<ChildProcess>
    function _exec(cmd: string, cwd?: string, options?: ObjectItem): Promise<ChildProcess>
    function _confirm(message: string, default_value?: boolean): Promise<boolean>
    function _select(message: string, choices: Array<string>, default_choice?: any): Promise<string>
    function _ask(message?: string, default_value?: string): Promise<string>
    function _table(rows: Array<Array<string>>, headers?: Array<string>, options?: ObjectItem): void
    function _dispatch(opts: Array<string>, ways: ObjectItem): Promise<string>
    function _check_option(command_name: string, opts: Array<string>, opt: OptionItem): void
    function _check_argument(command_name: string, args: Array<string>, arg: ArgumentItem): void
    function _sync_foreach(data: any, resolver: (value?: any, key?: any) => void): Promise<Context>
  }

  module is {
    function undefined(a: any): boolean
    function array(a: any): boolean
    function string(a: any): boolean
    function number(a: any): boolean
    function numeric(a: any): boolean
    function object(a: any): boolean
    function func(a: any): boolean
    function boolean(a: any): boolean
    function file(a: any): boolean
    function dir(a: any): boolean
    function invalid(a: any): boolean
    function contain(a: any): boolean
    function empty(a: any): boolean
  }

  module obj {
    function _flatten(obj: ObjectItem, sep: string): ObjectItem;
    function _unflatten(obj: ObjectItem, sep: string): ObjectItem;
    function _assign(targetObj: ObjectItem, ...objs: ObjectItem[]): ObjectItem;
    function _deep_clone(obj: ObjectItem): ObjectItem;
  }

  module str {
    class Emitter {
      config: ObjectItem
      constructor(options?: ObjectItem)
      emit(str: string, level?: Level): this;
      emitln(str: string, level?: Level): this;
      emitIndent(): string;
      output(): string;
    }
    function _str(s?: any): string;
    function _upper_first(str: string): string;
    function _lower_first(str: string): string;
    function _caml_case(name: string, pascalCase?: boolean): string;
    function _snake_case(name: string): string;
    function _render(tmpl_string: string, params?: Record<string, string>, left?: string, right?: string): string;
    function _render_with_file(tmpl_file: string, params?: Record<string, string>, left?: string, right?: string): string;
    function _fixed(content: string, length?: number, fillPosition?: string, fill?: string): string;
    function _equal_ignore_case(a: string, b: string): boolean;
  }
}
