'use strict';

(async ({ current_script, facet, facet_export, facet_load_error }) => { try {  // facet begin

    const DIALOG_CONTROL_ID = `dialog-${globalThis.core.uuidv4()}`;

    const CSS_CLASS_ACTIVE = 'active';

    const CSS_CLASS_ALERT   = 'alert';
    const CSS_CLASS_CONFIRM = 'confirm';

    class DialogController {
        constructor(control_id=DIALOG_CONTROL_ID) {
            this._setup_html(control_id);
            // add event handlers
            this._control_el.addEventListener('keydown', this._keydown_handler.bind(this), true);
            this._cancel_el.addEventListener('click', this._cancel_button_handler.bind(this));
            this._ok_el.addEventListener('click', this._ok_button_handler.bind(this));
            this._init_event_blocker();
            // reset dynamic state
            this._reset();
        }

        async alert(message) {
            const pending_promise = this._create_pending_promise();
            this._text_el.textContent = message;
            this._control_el.classList.add(CSS_CLASS_ACTIVE);
            this._control_el.classList.add(CSS_CLASS_ALERT);
            this._ok_el.focus();
            this._enable_event_blocker();
            return pending_promise;
        }

        async confirm(message) {
            const pending_promise = this._create_pending_promise();
            this._text_el.textContent = message;
            this._control_el.classList.add(CSS_CLASS_ACTIVE);
            this._control_el.classList.add(CSS_CLASS_CONFIRM);
            this._ok_el.focus();
            this._enable_event_blocker();
            return pending_promise;
        }

        cancel() {
            this._clear_current_pending_promise();
        }

        get current_dialog_id (){ return this._current_dialog_id; }

        // === INTERNAL METHODS ===

        _setup_html(control_id) {
            this._control_id = control_id;
            this._text_id    = `${this._control_id}_text`;
            this._cancel_id  = `${this._control_id}_cancel`;
            this._ok_id      = `${this._control_id}_ok`;
            this._blocker_id = `${this._control_id}_event_blocker`;

            // create HTML:
            //
            // <div id="dialog" class="">
            //     <div id="dialog_text"></div>
            //     <span>
            //         <button id="dialog_cancel">Cancel</button>
            //         <button id="dialog_ok">Ok</button>
            //     </span>
            // </div>
            // <div id="dialog_event_blocker" tabindex="0"></div>

            this._control_el = globalThis.core.create_element('div', { id: this._control_id });
            this._text_el = globalThis.core.create_child_element(this._control_el, 'div', { id: this._text_id });
            const button_span = globalThis.core.create_child_element(this._control_el, 'span');
            this._cancel_el = globalThis.core.create_child_element(button_span, 'button', { id: this._cancel_id });
            this._cancel_el.appendChild(document.createTextNode('Cancel'));
            this._ok_el = globalThis.core.create_child_element(button_span, 'button', { id: this._ok_id });
            this._ok_el.appendChild(document.createTextNode('Ok'));

            this._blocker_el = globalThis.core.create_element('div', { id: this._blocker_id, tabindex: 0 });

            document.body.insertBefore(this._blocker_el, document.body.firstChild);
            document.body.insertBefore(this._control_el, this._blocker_el);
        }

        _reset() {
            this._control_el.classList.remove(CSS_CLASS_ACTIVE);
            this._control_el.classList.remove(CSS_CLASS_ALERT);
            this._control_el.classList.remove(CSS_CLASS_CONFIRM);
            this._disable_event_blocker();
            this._resolve_op = undefined;
            this._reject_op  = undefined;
            this._current_pending_promise = undefined;
            this._current_dialog_id = undefined;
        }

        _clear_current_pending_promise() {
            if (this._current_pending_promise) {
                this._reject_op('operation canceled');  // also calls this._reset()
            }
        }

        _create_pending_promise() {
            this._clear_current_pending_promise();  // clear previous dialog, if any
            this._current_dialog_id = globalThis.core.uuidv4();  // for identification of this dialog
            this._current_pending_promise = new Promise((resolve, reject) => {
                this._resolve_op = (message) => {
                    this._reset();
                    resolve(message);
                };
                this._reject_op = (message) => {
                    this._reset();
                    reject(message);
                };
            });
            return this._current_pending_promise;
        }

        _keydown_handler(event) {
            if (event.key === 'Escape') {
                event.stopPropagation();
                event.preventDefault();
                this._perform_cancel();
            } else if (event.key === 'Enter') {
                event.stopPropagation();
                event.preventDefault();
                this._perform_ok();
            }
        }

        _cancel_button_handler(event) {
            this._perform_cancel();
        }

        _ok_button_handler(event) {
            this._perform_ok();
        }

        _perform_cancel() {
            this._resolve_op(undefined);
        }

        _perform_ok() {
            this._resolve_op(true);
        }

        _init_event_blocker() {
            this._make_element_opaque_to_events(this._control_el, this._ok_el, false);
            this._make_element_opaque_to_events(this._blocker_el, this._ok_el, true);
            this._disable_event_blocker();
        }

        _enable_event_blocker() {
            const control_rect = this._control_el.getBoundingClientRect();
            const top = control_rect.top + control_rect.height;
            this._blocker_el.style.width  = '100%';
            this._blocker_el.style.height = '100%';
            this._blocker_el.style.top    = `${top}px`;
            this._blocker_el.classList.add(CSS_CLASS_ACTIVE);
        }

        _disable_event_blocker() {
            this._blocker_el.classList.remove(CSS_CLASS_ACTIVE);
        }

        _make_element_opaque_to_events(el, refocus_el, click_event_too) {
            el.onfocus = (event) => {
                refocus_el.focus();
            };
            for (const event_name of ['keydown', 'keypress', 'keyup', 'touchstart', 'touchend', 'touchcancel', 'touchmove']) {
                el.addEventListener(event_name, (event) => {
                    if (event.target !== this._ok_el && event.target !== this._cancel_el) {
                        event.stopPropagation();
                        event.preventDefault();
                    }
                }, true);
            }
            if (click_event_too) {
                el.addEventListener('click', (event) => {
                    event.stopPropagation();
                    event.preventDefault();
                }, true);
            }
        }
    }


    // === INITIALIZE DOCUMENT STATE ===


    const stylesheet_text = `
#dialog {
    display: none;
    padding: 0.5rem 0 0.5rem 0.75rem;
    border: 7px double darkorange;
    background-color: cornsilk;
}

#dialog.active {
    display: block;
}

#dialog button {
    margin: 0.5rem 0.5rem 0.5rem 0;
}

#dialog_text {
    margin: 0.5rem 0.5rem 0.5rem 0;
}

#dialog_cancel {
    display: none;
}
#dialog.confirm #dialog_cancel {
    display: inline;
}

#dialog_ok {
}

#dialog_event_blocker {
    display: none;
    position: absolute;
    background-color: #80808080;
}
#dialog_event_blocker.active {
    display: block;
}
`;
    // add style sheet
    globalThis.core.create_inline_stylesheet(document.head, stylesheet_text.replaceAll('#dialog', `#${DIALOG_CONTROL_ID}`));


    // === EXPORT ===

    // export dialog controller instance
    facet_export(new DialogController());

} catch (err) { facet_load_error(err, current_script); } })(globalThis.core.facet_init());  // facet end
