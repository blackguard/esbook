# EXPRESSION EVALUATION

Within an expression, the "this" object references the eval_state
object of the notebook.  This object persists until the notebook
is opened to a new file or is cleared, at which point it is reset
to {}.

During evaluation, this.eval_context references an object whose
properties are available directly for evaluation within any
interaction element, without the need to prefix them with any parent
object.  In this sense, this.eval_context acts like a global
environment for the notebook without the need to modify globalThis.

global_export(...objects) assigns new properties to this.eval_context.
Those properties then become available "globally".  Note that the
"global" objects are available from any interaction element, that
is until the notebook is opened to a new file or is cleared.

Other properties set on the "this" object, like the "global"
properties, persist until the notebook is opened to a new file or
is cleared.  However, those properties must be prefixed by "this."
to reference them.

A return statement within an interaction element terminates the
evaluation and the value of the return statement becomes the result
of the evaluation.

## Ephemeral eval_context

During evaluation, a number of other values are available "globally",
though these values do no persist after the particular evaluation.
These values include output_context (which provides utilities for
manipulation of the output of the interaction element), various
mathematics interfaces, and various graphics functions and other
functions to manipluate the output.  Also included are:

- import_lib:    import other libraries from the lib/ directory
- global_export: export new "global" properties
- is_stopped:    determine if the evaluation has been stopped

These all continue to be available even after the evaluation has
returned if there are any async actions still active.
See the method _create_ephemeral_eval_context().
