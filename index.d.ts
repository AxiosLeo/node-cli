import { Color } from 'colors';
import { ChildProcess, SpawnOptionsWithoutStdio } from 'child_process';
import Big from 'big.js';

type Level = number | null | boolean | string;

interface ObjectItem {
  [key: string]: any;
}

type LocaleSettings = {
  sets: string[],
  dir: string,
  use?: string,
  format?: 'js' | 'json'
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
  options?: OptionItem[]
};

type TableOptions = {
  columns_width?: Array<number>,
  columns_align?: Array<string>,
  margin_left?: number,
  spacing?: string,
  padding?: string
};

export declare class App {
  config: AppSettings;
  opts?: OptionItem[]
  commands: Record<string, Command>
  constructor(settings?: AppSettings);

  /**
   * add global options for the CLI application
   * @param name option name
   * @param short short option name
   * @param desc description of the option
   * @param mode required|optional
   * @param _default 
   */
  addGlobalOption(
    name: string,
    short?: string,
    desc?: string,
    mode?: MODE,
    _default?: any
  ): this;

  /**
   * enable locale translation using i18n
   * @param options 
   */
  locale(options?: LocaleSettings): void;

  /**
   * register command with Class/Object/path-string
   * @param cmd 
   */
  register(cmd: any): this;

  /**
   * run CLI application
   * @param options 
   */
  start(options?: AppSettings): Promise<void>;

  /**
   * exec the specified command of the CLI application
   * @param name 
   * @param argvSlice 
   */
  exec(name: string, argvSlice?: number[]): Promise<void>;
}

type CommandSettings = {
  name: string,
  show?: boolean, // show command in help, default is true
  bin?: string,
  alias?: string[],
  desc?: string,
  args?: ArgumentItem[],
  options?: OptionItem[],
};

type Align = 'left' | 'right' | 'center' | 'l' | 'r' | 'c';

type PrintTableOptions = {
  columns_width: number[],
  columns_align?: Align[],
  margin_left?: number,
  spacing?: string,
  padding?: string
};

export declare abstract class Command {
  config: CommandSettings
  args?: ArgumentItem[]
  opts?: OptionItem[]
  constructor(config?: CommandSettings);
  /**
   * add argument of current command
   * @param name argument name
   * @param desc argument description
   * @param mode argument mode : required | optional
   * @param default_value 
   */
  addArgument(name: string, desc?: string, mode?: MODE, default_value?: any): this;

  /**
   * add option of current command
   * @param name option name
   * @param short option short name
   * @param desc option description
   * @param mode option mode : required | optional
   * @param default_value 
   */
  addOption(name: string, short?: string, desc?: string, mode?: MODE, default_value?: any): this;

  /**
   * print usage of current command
   */
  usage(): void;

  /**
   * exec current command
   * @param args 
   * @param options 
   * @param argList 
   * @param app 
   */
  abstract exec(args: ObjectItem, options: ObjectItem, argList: string[], app: App): Promise<void>;

  /**
   * ask input something
   * @param message 
   * @param default_value 
   */
  ask(message: string, default_value?: any): Promise<string>;

  /**
   * confirm for some operation
   * @param message 
   * @param default_value 
   */
  confirm(message: string, default_value?: boolean): Promise<boolean>;

  /**
   * select an action
   * @param message 
   * @param choices 
   * @param default_choice 
   */
  select(message: string, choices: string[], default_choice?: any): Promise<string>;

  /**
   * print table on console
   * @param rows 
   * @param headers 
   */
  table(rows: string[][], headers?: string[], options?: PrintTableOptions): void;
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

  /**
   * start with the specified step
   * @param context 
   * @param curr 
   */
  dispatch(context: TContext, curr: string): Promise<void>;

  /**
   * start with the first step
   * @param context 
   */
  start(context: TContext): Promise<TContext>;
}

export declare class Configuration {
  [key: string]: any
  constructor(config?: ObjectItem, sep?: string);

  /**
   * initialize configuration
   * @param config 
   * @param sep 
   */
  init(config?: ObjectItem, sep?: string): this;

  /**
   * set configuration with key-value
   * @param key 
   * @param value 
   */
  set(key: any, value: any): this;

  /**
   * assign to Configuration object
   * @param config 
   */
  assign(config: ObjectItem): this;

  /**
   * get some value by key
   * @param key 
   * @param _default 
   */
  get(key?: string, _default?: any): any;

  /**
   * Check if some configurations exist
   * @param keys 
   */
  has(keys: string[] | string): boolean;

  /**
   * check some configuration is valid
   * @param keys 
   */
  validate(keys?: string[] | string): string[];
}

interface Debug {

  /**
   * Print log message with datetime
   * @param data 
   */
  log(...data: any[]): void;

  /**
   * Print current exec position in code
   * @param label 
   * @param color_code 
   */
  pos(label: string, color_code: string): void;

  /**
   * Print anything on the console without exiting the process.
   * @param data 
   */
  dump(...data: any[]): void;

  /**
   * Print anything on the console and exiting the process.
   * @param data 
   */
  halt(...data: any[]): void;

  /**
   * Print anything on the console after the number of triggers is reached.
   * @param jumpNumber 
   * @param data 
   */
  jump(jumpNumber?: number, ...data: any[]): void;

  /**
   * Print anything on the console and throw an error.
   * @param data 
   */
  stack(...data: any[]): void;

  /**
   * Print warning message and not exiting the process.
   * @param data 
   */
  warning(...data: any[]): void;

  /**
   * Print warning message and pause the process.
   * only supported in use async/await
   * @param data 
   */
  pause(...data: any[]): Promise<void>;

  /**
   * Pause process and print something on the console. Only support async method.
   * @param data 
   */
  error(...data: any[]): void;
}

export const debug: Debug;

interface LocalesConfig {
  /**
   * The supported locales, expects an array of locale strings
   */
  sets: string[]

  /**
   * The path to the language packs directory, *.json|*.js
   */
  dir: string

  /**
   * Specified language set
   */
  use?: string

  /**
   * locales file extension.
   * support 'json' or 'js' file
   * default value is 'json'
   */
  format?: string
}

export module locales {
  class Translator {
    constructor(options: LocalesConfig);

    /**
     * load language dictionary
     * @param use 
     */
    load(use?: string): void;

    /**
     * patch dictionaries
     * @param lang_set 
     * @param dict 
     */
    patch(lang_set: string, dict: Record<string, string>): void;

    /**
     * translate by specified language set
     * @param str 
     * @param params 
     */
    trans(str: string, params: Record<string, string>, lang_set?: string | null): string;
  }

  const translator: Translator;

  /**
   * reload dictionaries
   */
  function restore(): void;

  /**
   * initialize translator instance
   * @param config 
   */
  function init(config: LocalesConfig): void;

  /**
   * translate
   * @param str 
   * @param params 
   */
  function __(str: string, params?: Record<string, string>, lang_set?: string | null): string;

  /**
   * specified language set
   * @param use
   */
  function use(set: string): void;

  /**
   * disable translation
   */
  function disable(): void;
}

interface Printer {
  colors: Color
  /**
   * Pad a string to a certain length with another string
   * @param content 
   * @param length 
   * @param fillPosition 
   * @param fill 
   */
  fixed(content: string, length?: number, fillPosition?: string, fill?: string): this;

  /**
   * set themes
   * @param options 
   */
  themes(options?: Record<string, string>): Record<string, string>;

  /**
   * Print some string on the console with EOL.
   * @param str 
   */
  println(str?: string): this;

  /**
   * Print some string on the console without EOL.
   * @param str 
   */
  print(str?: string): this;

  /**
   * enable print
   */
  enable(): this;

  /**
   * disable print
   */
  disable(): this;

  // print colorful
  input(str: string): this;
  verbose(str: string): this;
  info(str: string): this;
  data(str: string): this;
  debug(str: string): this;
  yellow(str: string): this;
  green(str: string): this;
  red(str: string): this;

  warning(...str: string[]): this;
  success(...str: string[]): this;
  error(...str: string[]): this;
}

export const printer: Printer

export namespace helper {
  module fs {
    /**
     * get extension of file without dot
     * @param filename 
     */
    function _ext(filename?: string): string;

    /**
     * count file md5 value
     * @param filename 
     */
    function _md5(filename?: string): Promise<string>;

    /**
     * sync files to target directory from source directory
     * @param source 
     * @param target 
     * @param ext default value is = '*', js|ts ...
     * @param reback default value if true
     */
    function _sync(source: string, target: string, ext?: string, reback?: boolean): Promise<void>;

    /**
    * list files in some directory
    * @param dir 
    * @param full 
    * @param ext .js|.ts
    */
    function _list(dir: string, full?: boolean, ext?: string): Promise<string[]>;

    /**
     * read content from single file
     * @param filepath 
     */
    function _read(filepath: string): Promise<string>;

    /**
     * copy file or dir
     * @param source 
     * @param target 
     * @param recur 
     */
    function _copy(source: string, target: string, recur?: boolean): Promise<void>;

    /**
     * move files or dir to somewhere
     * @param source 
     * @param target 
     */
    function _move(source: string, target: string): Promise<void>;

    /**
     * make dir where it dose not exists
     * @param dir 
     */
    function _mkdir(dir: string): Promise<void>;

    /**
     * write some content to single file
     * @param filepath 
     * @param content 
     */
    function _write(filepath: string, content: string): Promise<void>;

    /**
    * remove some files
    * @param filepath 
    * @param recur 
    */
    function _remove(filepath: string, recur?: boolean): Promise<void>;

    /**
    * search some files by extension
    * @param dir 
    * @param ext js|ts
    * @param recur 
    */
    function _search(dir: string, ext?: string, recur?: boolean): Promise<string[]>;

    /**
    * check single file exists
    * @param filepath 
    */
    function _exists(filepath: string): Promise<boolean>;

    /**
     * append some content to single file
     * @param filepath 
     * @param content 
     */
    function _append(filepath: string, content: string): Promise<void>;

    /**
    * check it is dir
    * @param dirpath 
    */
    function _is_dir(dirpath: string): Promise<boolean>;

    /**
    * check it is file
    * @param filepath 
    */
    function _is_file(filepath: string): Promise<boolean>;

    /**
     * find the root path including the specified subdirectory
     * @param sub 
     * @param dir 
     * @param msg 
     */
    function _find_root(sub: string, dir?: string | null | undefined, msg?: string): Promise<string>;

    /**
     * read content from single file and parse to JSON object
     * @param filepath 
     */
    function _read_json(filepath: string): Promise<string>;
  }

  module cmd {
    /**
     * sleep by milliseconds
     * @param ms 
     */
    function _sleep(ms: number): Promise<void>;

    /**
     * retry exec some logic
     * @param {(curr_times: number, retry_times: number) => Promise<void>} handler
     * @param {number} retry_times
     * @param {number} curr_times
     */
    function _retry(handler: (curr_times: number, retry_times: number) => Promise<void>, retry_times: number, curr_times: number): Promise<void>;

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
    function _exec(cmd: string, cwd?: string, options?: SpawnOptionsWithoutStdio): Promise<ChildProcess>

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
     * console conversations: select multi actions
     * @param message 
     * @param choices 
     * @param default_choice 
     */
    function _select_multi(message: string, choices: string[], default_choice?: any): Promise<string>

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
    function _table(rows: string[][], headers?: string[], options?: TableOptions): void

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
    * execute asynchronous tasks in a synchronous manner
    * @param data 
    * @param resolver 
    */
    function _foreach(data: any, resolver: (value?: any, key?: any) => void | Promise<void>): Promise<Context>

    /**
     * execute asynchronous functions in parallel
     * @param functions 
     * @param options 
     */
    function _parallel(functions: Function, options?: { parallelCount?: number, waitAll?: boolean }): Promise<void>
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

  export interface Tree2ArrayOptions {
    /**
     * The name of the parent node index
     * @default 'parent_id'
     */
    parent_index?: string;

    /**
     * The name of the data index
     * @default 'id'
     */
    data_index?: string;

    /**
     * The name of the child node index
     * @default 'child'
     */
    child_name?: string;
  }

  interface BaseObject {
    id: string,
    name: string,
  }

  module obj {
    function _flatten(obj: ObjectItem, sep?: string): ObjectItem;
    function _flatten<T>(obj: T, sep: string): ObjectItem;
    function _unflatten(obj: ObjectItem, sep: string): ObjectItem;
    function _unflatten<T>(obj: ObjectItem, sep: string): T;
    function _assign(targetObj: ObjectItem, ...objs: ObjectItem[]): ObjectItem;
    function _assign<T>(targetObj: T, ...objs: ObjectItem[]): T;
    function _deep_clone(obj: ObjectItem): ObjectItem;
    function _deep_clone<T>(obj: T): T;
  }

  export interface EmitterConfig {
    indent?: string   // default is '  '
    eol?: string      // default is os.EOL
    level?: number    // default is 0
    encoding?: string // default is 'utf8'
  }

  module str {
    class Emitter {
      config: EmitterConfig
      constructor(options?: EmitterConfig)

      /**
       * append string without EOL
       * @param str 
       * @param level integer|null|false|string:(up|open|begin|start, down|close|end)
       */
      emit(str: string, level?: Level): this;

      /**
       * append string with EOL
       * @param str 
       * @param level integer|null|false|string:(up|open|begin|start, down|close|end)
       */
      emitln(str: string, level?: Level): this;

      /**
       * emit indent string
       * @param level integer|null|false|string:(up|open|begin|start, down|close|end)
       */
      emitIndent(level?: Level): string;

      /**
       * emit rows
       * @param rows 
       */
      emitRows(...rows: string[]): this;

      /**
       * curr output content
       */
      output(): string;
    }

    /**
     * Forced to string
     * @param str
     */
    function _str(str?: any): string;

    /**
     * Converts the first character of a string to upper case
     * @param str 
     */
    function _upper_first(str: string): string;

    /**
     * Converts the first character of a string to lower case.
     * @param str 
     */
    function _lower_first(str: string): string;

    /**
     * Converts the name string to camel case
     * @param name 
     * @param pascalCase 
     */
    function _caml_case(name: string, pascalCase?: boolean): string;

    /**
     * Converts the name string to snake case
     * @param name 
     */
    function _snake_case(name: string): string;

    /**
     * render string by params and template
     * @param tmpl_string 
     * @param params 
     * @param left_tag 
     * @param right_tag 
     */
    function _render(tmpl_string: string, params?: Record<string, string>, left_tag?: string, right_tag?: string): string;

    /**
     * render string by params and template file
     * @param tmpl_file 
     * @param params 
     * @param left 
     * @param right 
     */
    function _render_with_file(tmpl_file: string, params?: Record<string, string>, left_tag?: string, right_tag?: string): Promise<string>;

    /**
     * Pad a string to a certain length with another string
     * @param content 
     * @param length default is 10
     * @param fillPosition right|left
     * @param fill default is blank space " "
     */
    function _fixed(content: string, length?: number, fillPosition?: string, fill?: string): string;

    /**
     * Compare two strings in a case-sensitive manner
     * @param a 
     * @param b 
     */
    function _equal_ignore_case(a: string, b: string): boolean;

    /**
     * count MD5
     * @param str 
     * @param charset default is utf8
     */
    function _md5(str: string, charset?: string): string;

    /**
     * random string
     * @param dict 0123456789abcdf
     * @param len 8
     */
    function _random(dict?: string, len?: number)

    /**
     * get length of string
     * @param str 
     */
    function _len(str: string): number;
  }

  type ConvertNumberOptions = {
    digits?: string,
    length?: number
  }

  type ConvertNumberResult = {
    str: string,
    num: Big,
    digits: string,
    length?: number
  }

  module convert {
    /**
     * convert tree to array
     * @param tree 
     * @param options 
     */
    function _tree2array(tree: any[] | any, options?: Tree2ArrayOptions): any[];

    /**
     * convert array to tree
     * @param array 
     * @param options 
     */
    function _array2tree(array: any[], options?: Tree2ArrayOptions): any[];
    function _array2tree<T>(array: T[], options?: Tree2ArrayOptions): T[];

    /**
     * convert number to string with specified digits
     * @param number 
     * @param from 
     * @param to 
     * @param options default digits is '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'
     */
    function _number(number: number | string | Big, from: number, to: number, options?: ConvertNumberOptions): ConvertNumberResult;
  }
}
