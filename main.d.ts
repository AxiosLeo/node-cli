import { Color } from 'colors';
import { ChildProcess } from 'child_process';

type Level = number | null | boolean | string;

interface ObjectItem {
  [key: string]: any;
}

type LocaleSettings = {
  sets: string[],
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
  commands_sort?: string[]
  locale?: LocaleSettings
  options?: OptionItem[]
};

export declare class App {
  config: AppSettings;
  opts?: OptionItem[]
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
  alias?: string[],
  desc?: string,
  args?: ArgumentItem[],
  options?: OptionItem[],
};

export declare abstract class Command {
  config: CommandSettings
  args?: ArgumentItem[]
  opts?: OptionItem[]
  constructor(config?: CommandSettings);
  addArgument(name: string, desc?: string, default_value?: any): this;
  addOption(name: string, short?: string, desc?: string, default_value?: any): this;
  usage(): void;
  abstract exec(args?: ObjectItem, options?: ObjectItem, argList?: string[], app?: App): Promise<void>;
  ask(message: string, default_value?: any): Promise<string>;
  confirm(message: string, default_value?: boolean): Promise<boolean>;
  select(message: string, choices: string[], default_choice?: any): Promise<string>;
  table(rows: string[][], headers?: string[]): Promise<void>;
}

type Step = {
  [key: string]: any
  workflow?: string
  start?: number
  end?: number
  success?: boolean
  error?: Error
};

type Context = {
  [key: string]: any
  workflows?: string[]
  curr: Step
  steps?: Record<string, Step>
  success?: boolean
};

export declare class Workflow<TContext extends Context> {
  operator: Record<string, (context: TContext) => Promise<void | string>>
  workflows: string[]
  constructor(operator: Record<string, (context: TContext) => Promise<void | string>>, workflows?: string[]);
  dispatch(context: TContext, curr: string): Promise<void>;
  start(context: TContext): Promise<TContext>;
}

export declare class Configuration {
  [key: string]: any
  constructor(config?: ObjectItem, sep?: string);
  init(config?: ObjectItem, sep?: string);
  assign(config: ObjectItem);
  get(key?: string, _default?: any);
  validate(keys?: string[] | string);
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

interface LocalesConfig {
  sets: string[]
  dir: string
  use?: string
}

interface Locales {
  restore(): void;
  init(config: LocalesConfig): void;
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
    function _search(dir: string, ext?: string, recur?: boolean): Promise<string[]>;
    function _list(dir: string, full?: boolean, ext?: string): Promise<string[]>;
    function _remove(filepath: string, recur?: boolean): Promise<void>;
  }

  module cmd {
    /**
     * sleep by milliseconds
     * @param ms 
     */
    function _sleep(ms: number): Promise<void>;

    /**
     * exec bash commands, printout when finished
     * @param cmd 
     * @param cwd 
     * @param print 
     * @param throw_error 
     */
    function _shell(cmd: string, cwd?: string | null, print?: boolean, throw_error?: boolean): Promise<ChildProcess>

    /**
     * exec bash commands, immediate output
     * @param cmd 
     * @param cwd 
     * @param options 
     */
    function _exec(cmd: string, cwd?: string, options?: ObjectItem): Promise<ChildProcess>

    /**
     * console conversations: confirm input
     * @param message 
     * @param default_value 
     */
    function _confirm(message: string, default_value?: boolean): Promise<boolean>

    /**
     * console conversations: select action
     * @param message 
     * @param choices 
     * @param default_choice 
     */
    function _select(message: string, choices: string[], default_choice?: any): Promise<string>

    /**
     * console conversations: ask input
     * @param message 
     * @param default_value 
     */
    function _ask(message?: string, default_value?: string): Promise<string>

    /**
     * print table
     * @param rows 
     * @param headers 
     * @param options 
     */
    function _table(rows: string[][], headers?: string[], options?: ObjectItem): void

    /**
     * resolve actions from args[]
     * @example _dispatch(argList, { action1: '', action2: 'custom-action-name' });
     * @param opts 
     * @param ways 
     */
    function _dispatch(opts: string[], ways: ObjectItem): Promise<string>

    /**
     * check option of command
     * @param command_name 
     * @param opts 
     * @param opt 
     */
    function _check_option(command_name: string, opts: string[], opt: OptionItem): void

    /**
     * check argument of command
     * @param command_name 
     * @param args 
     * @param arg 
     */
    function _check_argument(command_name: string, args: string[], arg: ArgumentItem): void

    /**
     * exec async tasks one by one in sync
     * @param data 
     * @param resolver 
     */
    function _sync_foreach(data: any, resolver: (value?: any, key?: any) => void): Promise<Context>
  }

  module is {
    function undefined(a: any): boolean
    function array(a: any): boolean
    function string(a: any): boolean
    function integer(a: any): boolean
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

  export interface EmitterConfig {
    indent: string
    eol: string
    level: number
    encoding: string
  }

  module str {
    class Emitter {
      config: ObjectItem
      constructor(options?: EmitterConfig)
      /**
       * append string
       * @param str 
       * @param level 
       */
      emit(str: string, level?: Level): this;
      /**
       * append string with eol
       * @param str 
       * @param level 
       */
      emitln(str: string, level?: Level): this;
      /**
       * emit indent string
       */
      emitIndent(): string;
      /**
       * curr output content
       */
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
