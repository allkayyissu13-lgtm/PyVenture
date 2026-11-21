/* Web Worker: menjalankan kode Python siswa dengan Pyodide */
importScripts("https://cdn.jsdelivr.net/pyodide/v0.26.4/full/pyodide.js");

const HARNESS = `
import sys, io, traceback

def __run(code, inp):
    out = io.StringIO()
    old = (sys.stdout, sys.stderr, sys.stdin)
    sys.stdout = out
    sys.stderr = out
    sys.stdin = io.StringIO(inp)
    err = None
    try:
        exec(compile(code, "solution.py", "exec"), {"__name__": "__main__"})
    except SystemExit:
        pass
    except BaseException:
        err = traceback.format_exc()
    finally:
        sys.stdout, sys.stderr, sys.stdin = old
    return [out.getvalue(), err]
`;

let ready = null;
function init() {
  if (!ready) {
    ready = loadPyodide().then((py) => {
      py.runPython(HARNESS);
      return py;
    });
  }
  return ready;
}

self.onmessage = async (e) => {
  const { type, id, code, input } = e.data;

  if (type === "init") {
    try {
      await init();
      self.postMessage({ type: "ready", ok: true });
    } catch (err) {
      self.postMessage({ type: "ready", ok: false });
    }
    return;
  }

  try {
    const py = await init();
    const run = py.globals.get("__run");
    const res = run(code, input);
    const [stdout, error] = res.toJs();
    res.destroy();
    run.destroy();
    self.postMessage({ id, stdout: stdout || "", error: error || null });
  } catch (err) {
    self.postMessage({ id, stdout: "", error: String(err) });
  }
};