
(function(l, r) { if (l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (window.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.head.appendChild(r) })(window.document);
var app = (function () {
    'use strict';

    function noop() { }
    function assign(tar, src) {
        // @ts-ignore
        for (const k in src)
            tar[k] = src[k];
        return tar;
    }
    function add_location(element, file, line, column, char) {
        element.__svelte_meta = {
            loc: { file, line, column, char }
        };
    }
    function run(fn) {
        return fn();
    }
    function blank_object() {
        return Object.create(null);
    }
    function run_all(fns) {
        fns.forEach(run);
    }
    function is_function(thing) {
        return typeof thing === 'function';
    }
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }
    function validate_store(store, name) {
        if (!store || typeof store.subscribe !== 'function') {
            throw new Error(`'${name}' is not a store with a 'subscribe' method`);
        }
    }
    function subscribe(store, callback) {
        const unsub = store.subscribe(callback);
        return unsub.unsubscribe ? () => unsub.unsubscribe() : unsub;
    }
    function component_subscribe(component, store, callback) {
        component.$$.on_destroy.push(subscribe(store, callback));
    }
    function create_slot(definition, ctx, $$scope, fn) {
        if (definition) {
            const slot_ctx = get_slot_context(definition, ctx, $$scope, fn);
            return definition[0](slot_ctx);
        }
    }
    function get_slot_context(definition, ctx, $$scope, fn) {
        return definition[1] && fn
            ? assign($$scope.ctx.slice(), definition[1](fn(ctx)))
            : $$scope.ctx;
    }
    function get_slot_changes(definition, $$scope, dirty, fn) {
        if (definition[2] && fn) {
            const lets = definition[2](fn(dirty));
            if (typeof $$scope.dirty === 'object') {
                const merged = [];
                const len = Math.max($$scope.dirty.length, lets.length);
                for (let i = 0; i < len; i += 1) {
                    merged[i] = $$scope.dirty[i] | lets[i];
                }
                return merged;
            }
            return $$scope.dirty | lets;
        }
        return $$scope.dirty;
    }

    function append(target, node) {
        target.appendChild(node);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        node.parentNode.removeChild(node);
    }
    function destroy_each(iterations, detaching) {
        for (let i = 0; i < iterations.length; i += 1) {
            if (iterations[i])
                iterations[i].d(detaching);
        }
    }
    function element(name) {
        return document.createElement(name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function empty() {
        return text('');
    }
    function listen(node, event, handler, options) {
        node.addEventListener(event, handler, options);
        return () => node.removeEventListener(event, handler, options);
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function toggle_class(element, name, toggle) {
        element.classList[toggle ? 'add' : 'remove'](name);
    }
    function custom_event(type, detail) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, false, false, detail);
        return e;
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }
    function get_current_component() {
        if (!current_component)
            throw new Error(`Function called outside component initialization`);
        return current_component;
    }
    function onMount(fn) {
        get_current_component().$$.on_mount.push(fn);
    }
    function createEventDispatcher() {
        const component = get_current_component();
        return (type, detail) => {
            const callbacks = component.$$.callbacks[type];
            if (callbacks) {
                // TODO are there situations where events could be dispatched
                // in a server (non-DOM) environment?
                const event = custom_event(type, detail);
                callbacks.slice().forEach(fn => {
                    fn.call(component, event);
                });
            }
        };
    }
    // TODO figure out if we still want to support
    // shorthand events, or if we want to implement
    // a real bubbling mechanism
    function bubble(component, event) {
        const callbacks = component.$$.callbacks[event.type];
        if (callbacks) {
            callbacks.slice().forEach(fn => fn(event));
        }
    }

    const dirty_components = [];
    const binding_callbacks = [];
    const render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = Promise.resolve();
    let update_scheduled = false;
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    function flush() {
        const seen_callbacks = new Set();
        do {
            // first, call beforeUpdate functions
            // and update components
            while (dirty_components.length) {
                const component = dirty_components.shift();
                set_current_component(component);
                update(component.$$);
            }
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    callback();
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
    }
    function update($$) {
        if ($$.fragment !== null) {
            $$.update();
            run_all($$.before_update);
            const dirty = $$.dirty;
            $$.dirty = [-1];
            $$.fragment && $$.fragment.p($$.ctx, dirty);
            $$.after_update.forEach(add_render_callback);
        }
    }
    const outroing = new Set();
    let outros;
    function group_outros() {
        outros = {
            r: 0,
            c: [],
            p: outros // parent group
        };
    }
    function check_outros() {
        if (!outros.r) {
            run_all(outros.c);
        }
        outros = outros.p;
    }
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }
    function transition_out(block, local, detach, callback) {
        if (block && block.o) {
            if (outroing.has(block))
                return;
            outroing.add(block);
            outros.c.push(() => {
                outroing.delete(block);
                if (callback) {
                    if (detach)
                        block.d(1);
                    callback();
                }
            });
            block.o(local);
        }
    }
    function create_component(block) {
        block && block.c();
    }
    function mount_component(component, target, anchor) {
        const { fragment, on_mount, on_destroy, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        // onMount happens before the initial afterUpdate
        add_render_callback(() => {
            const new_on_destroy = on_mount.map(run).filter(is_function);
            if (on_destroy) {
                on_destroy.push(...new_on_destroy);
            }
            else {
                // Edge case - component was destroyed immediately,
                // most likely as a result of a binding initialising
                run_all(new_on_destroy);
            }
            component.$$.on_mount = [];
        });
        after_update.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        const $$ = component.$$;
        if ($$.fragment !== null) {
            run_all($$.on_destroy);
            $$.fragment && $$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            $$.on_destroy = $$.fragment = null;
            $$.ctx = [];
        }
    }
    function make_dirty(component, i) {
        if (component.$$.dirty[0] === -1) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty.fill(0);
        }
        component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
    }
    function init(component, options, instance, create_fragment, not_equal, props, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
        const prop_values = options.props || {};
        const $$ = component.$$ = {
            fragment: null,
            ctx: null,
            // state
            props,
            update: noop,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            before_update: [],
            after_update: [],
            context: new Map(parent_component ? parent_component.$$.context : []),
            // everything else
            callbacks: blank_object(),
            dirty
        };
        let ready = false;
        $$.ctx = instance
            ? instance(component, prop_values, (i, ret, value = ret) => {
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if ($$.bound[i])
                        $$.bound[i](value);
                    if (ready)
                        make_dirty(component, i);
                }
                return ret;
            })
            : [];
        $$.update();
        ready = true;
        run_all($$.before_update);
        // `false` as a special case of no DOM component
        $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
        if (options.target) {
            if (options.hydrate) {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.l(children(options.target));
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor);
            flush();
        }
        set_current_component(parent_component);
    }
    class SvelteComponent {
        $destroy() {
            destroy_component(this, 1);
            this.$destroy = noop;
        }
        $on(type, callback) {
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set() {
            // overridden by instance, if it has props
        }
    }

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, detail));
    }
    function append_dev(target, node) {
        dispatch_dev("SvelteDOMInsert", { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev("SvelteDOMInsert", { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev("SvelteDOMRemove", { node });
        detach(node);
    }
    function listen_dev(node, event, handler, options, has_prevent_default, has_stop_propagation) {
        const modifiers = options === true ? ["capture"] : options ? Array.from(Object.keys(options)) : [];
        if (has_prevent_default)
            modifiers.push('preventDefault');
        if (has_stop_propagation)
            modifiers.push('stopPropagation');
        dispatch_dev("SvelteDOMAddEventListener", { node, event, handler, modifiers });
        const dispose = listen(node, event, handler, options);
        return () => {
            dispatch_dev("SvelteDOMRemoveEventListener", { node, event, handler, modifiers });
            dispose();
        };
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev("SvelteDOMRemoveAttribute", { node, attribute });
        else
            dispatch_dev("SvelteDOMSetAttribute", { node, attribute, value });
    }
    function prop_dev(node, property, value) {
        node[property] = value;
        dispatch_dev("SvelteDOMSetProperty", { node, property, value });
    }
    function set_data_dev(text, data) {
        data = '' + data;
        if (text.data === data)
            return;
        dispatch_dev("SvelteDOMSetData", { node: text, data });
        text.data = data;
    }
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error(`'target' is a required option`);
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn(`Component was already destroyed`); // eslint-disable-line no-console
            };
        }
    }

    /* home/one/forui/container/Container.svelte generated by Svelte v3.16.7 */

    const file = "home/one/forui/container/Container.svelte";

    function create_fragment(ctx) {
    	let div;
    	let current;
    	const default_slot_template = /*$$slots*/ ctx[5].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[4], null);

    	const block = {
    		c: function create() {
    			div = element("div");
    			if (default_slot) default_slot.c();
    			attr_dev(div, "class", "svelte-aalbab");
    			toggle_class(div, "scrollx", /*scrollx*/ ctx[0]);
    			toggle_class(div, "scrolly", /*scrolly*/ ctx[1]);
    			toggle_class(div, "small", /*small*/ ctx[2]);
    			toggle_class(div, "middle", /*middle*/ ctx[3]);
    			add_location(div, file, 0, 0, 0);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			if (default_slot) {
    				default_slot.m(div, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (default_slot && default_slot.p && dirty & /*$$scope*/ 16) {
    				default_slot.p(get_slot_context(default_slot_template, ctx, /*$$scope*/ ctx[4], null), get_slot_changes(default_slot_template, /*$$scope*/ ctx[4], dirty, null));
    			}

    			if (dirty & /*scrollx*/ 1) {
    				toggle_class(div, "scrollx", /*scrollx*/ ctx[0]);
    			}

    			if (dirty & /*scrolly*/ 2) {
    				toggle_class(div, "scrolly", /*scrolly*/ ctx[1]);
    			}

    			if (dirty & /*small*/ 4) {
    				toggle_class(div, "small", /*small*/ ctx[2]);
    			}

    			if (dirty & /*middle*/ 8) {
    				toggle_class(div, "middle", /*middle*/ ctx[3]);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (default_slot) default_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance($$self, $$props, $$invalidate) {
    	let { scrollx = false } = $$props;
    	let { scrolly = false } = $$props;
    	let { small = false } = $$props;
    	let { middle = false } = $$props;
    	const writable_props = ["scrollx", "scrolly", "small", "middle"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Container> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;

    	$$self.$set = $$props => {
    		if ("scrollx" in $$props) $$invalidate(0, scrollx = $$props.scrollx);
    		if ("scrolly" in $$props) $$invalidate(1, scrolly = $$props.scrolly);
    		if ("small" in $$props) $$invalidate(2, small = $$props.small);
    		if ("middle" in $$props) $$invalidate(3, middle = $$props.middle);
    		if ("$$scope" in $$props) $$invalidate(4, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => {
    		return { scrollx, scrolly, small, middle };
    	};

    	$$self.$inject_state = $$props => {
    		if ("scrollx" in $$props) $$invalidate(0, scrollx = $$props.scrollx);
    		if ("scrolly" in $$props) $$invalidate(1, scrolly = $$props.scrolly);
    		if ("small" in $$props) $$invalidate(2, small = $$props.small);
    		if ("middle" in $$props) $$invalidate(3, middle = $$props.middle);
    	};

    	return [scrollx, scrolly, small, middle, $$scope, $$slots];
    }

    class Container extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance, create_fragment, safe_not_equal, {
    			scrollx: 0,
    			scrolly: 1,
    			small: 2,
    			middle: 3
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Container",
    			options,
    			id: create_fragment.name
    		});
    	}

    	get scrollx() {
    		throw new Error("<Container>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set scrollx(value) {
    		throw new Error("<Container>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get scrolly() {
    		throw new Error("<Container>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set scrolly(value) {
    		throw new Error("<Container>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get small() {
    		throw new Error("<Container>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set small(value) {
    		throw new Error("<Container>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get middle() {
    		throw new Error("<Container>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set middle(value) {
    		throw new Error("<Container>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* home/one/forui/button/BtnGroup.svelte generated by Svelte v3.16.7 */

    const file$1 = "home/one/forui/button/BtnGroup.svelte";

    function create_fragment$1(ctx) {
    	let div;
    	let current;
    	const default_slot_template = /*$$slots*/ ctx[7].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[6], null);

    	const block_1 = {
    		c: function create() {
    			div = element("div");
    			if (default_slot) default_slot.c();
    			attr_dev(div, "class", "svelte-w6pxxg");
    			toggle_class(div, "center", /*center*/ ctx[0]);
    			toggle_class(div, "block", /*block*/ ctx[1]);
    			toggle_class(div, "right", /*right*/ ctx[2]);
    			toggle_class(div, "between", /*between*/ ctx[3]);
    			toggle_class(div, "wrap", /*wrap*/ ctx[4]);
    			toggle_class(div, "gutter", /*gutter*/ ctx[5]);
    			add_location(div, file$1, 0, 0, 0);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			if (default_slot) {
    				default_slot.m(div, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (default_slot && default_slot.p && dirty & /*$$scope*/ 64) {
    				default_slot.p(get_slot_context(default_slot_template, ctx, /*$$scope*/ ctx[6], null), get_slot_changes(default_slot_template, /*$$scope*/ ctx[6], dirty, null));
    			}

    			if (dirty & /*center*/ 1) {
    				toggle_class(div, "center", /*center*/ ctx[0]);
    			}

    			if (dirty & /*block*/ 2) {
    				toggle_class(div, "block", /*block*/ ctx[1]);
    			}

    			if (dirty & /*right*/ 4) {
    				toggle_class(div, "right", /*right*/ ctx[2]);
    			}

    			if (dirty & /*between*/ 8) {
    				toggle_class(div, "between", /*between*/ ctx[3]);
    			}

    			if (dirty & /*wrap*/ 16) {
    				toggle_class(div, "wrap", /*wrap*/ ctx[4]);
    			}

    			if (dirty & /*gutter*/ 32) {
    				toggle_class(div, "gutter", /*gutter*/ ctx[5]);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (default_slot) default_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block: block_1,
    		id: create_fragment$1.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block_1;
    }

    function instance$1($$self, $$props, $$invalidate) {
    	let { center = false } = $$props;
    	let { block = false } = $$props;
    	let { right = false } = $$props;
    	let { between = false } = $$props;
    	let { wrap = false } = $$props;
    	let { gutter = false } = $$props;
    	const writable_props = ["center", "block", "right", "between", "wrap", "gutter"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<BtnGroup> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;

    	$$self.$set = $$props => {
    		if ("center" in $$props) $$invalidate(0, center = $$props.center);
    		if ("block" in $$props) $$invalidate(1, block = $$props.block);
    		if ("right" in $$props) $$invalidate(2, right = $$props.right);
    		if ("between" in $$props) $$invalidate(3, between = $$props.between);
    		if ("wrap" in $$props) $$invalidate(4, wrap = $$props.wrap);
    		if ("gutter" in $$props) $$invalidate(5, gutter = $$props.gutter);
    		if ("$$scope" in $$props) $$invalidate(6, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => {
    		return {
    			center,
    			block,
    			right,
    			between,
    			wrap,
    			gutter
    		};
    	};

    	$$self.$inject_state = $$props => {
    		if ("center" in $$props) $$invalidate(0, center = $$props.center);
    		if ("block" in $$props) $$invalidate(1, block = $$props.block);
    		if ("right" in $$props) $$invalidate(2, right = $$props.right);
    		if ("between" in $$props) $$invalidate(3, between = $$props.between);
    		if ("wrap" in $$props) $$invalidate(4, wrap = $$props.wrap);
    		if ("gutter" in $$props) $$invalidate(5, gutter = $$props.gutter);
    	};

    	return [center, block, right, between, wrap, gutter, $$scope, $$slots];
    }

    class BtnGroup extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$1, create_fragment$1, safe_not_equal, {
    			center: 0,
    			block: 1,
    			right: 2,
    			between: 3,
    			wrap: 4,
    			gutter: 5
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "BtnGroup",
    			options,
    			id: create_fragment$1.name
    		});
    	}

    	get center() {
    		throw new Error("<BtnGroup>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set center(value) {
    		throw new Error("<BtnGroup>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get block() {
    		throw new Error("<BtnGroup>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set block(value) {
    		throw new Error("<BtnGroup>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get right() {
    		throw new Error("<BtnGroup>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set right(value) {
    		throw new Error("<BtnGroup>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get between() {
    		throw new Error("<BtnGroup>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set between(value) {
    		throw new Error("<BtnGroup>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get wrap() {
    		throw new Error("<BtnGroup>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set wrap(value) {
    		throw new Error("<BtnGroup>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get gutter() {
    		throw new Error("<BtnGroup>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set gutter(value) {
    		throw new Error("<BtnGroup>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* home/one/forui/button/Button.svelte generated by Svelte v3.16.7 */

    const file$2 = "home/one/forui/button/Button.svelte";
    const get_badge_slot_changes = dirty => ({});
    const get_badge_slot_context = ctx => ({});

    function create_fragment$2(ctx) {
    	let button;
    	let t0_value = (/*label*/ ctx[1] || "") + "";
    	let t0;
    	let t1;
    	let figure;
    	let current;
    	let dispose;
    	const default_slot_template = /*$$slots*/ ctx[17].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[16], null);
    	const badge_slot_template = /*$$slots*/ ctx[17].badge;
    	const badge_slot = create_slot(badge_slot_template, ctx, /*$$scope*/ ctx[16], get_badge_slot_context);

    	const block_1 = {
    		c: function create() {
    			button = element("button");

    			if (!default_slot) {
    				t0 = text(t0_value);
    			}

    			if (default_slot) default_slot.c();
    			t1 = space();
    			figure = element("figure");
    			if (badge_slot) badge_slot.c();
    			attr_dev(figure, "class", "svelte-11wkn4z");
    			add_location(figure, file$2, 20, 2, 296);
    			attr_dev(button, "aria-label", /*label*/ ctx[1]);
    			attr_dev(button, "title", /*label*/ ctx[1]);
    			button.disabled = /*disabled*/ ctx[2];
    			button.hidden = /*hidden*/ ctx[3];
    			attr_dev(button, "style", /*style*/ ctx[15]);
    			attr_dev(button, "class", "svelte-11wkn4z");
    			toggle_class(button, "active", /*active*/ ctx[4]);
    			toggle_class(button, "success", /*success*/ ctx[5]);
    			toggle_class(button, "inverse", /*inverse*/ ctx[6]);
    			toggle_class(button, "danger", /*danger*/ ctx[7]);
    			toggle_class(button, "clean", /*clean*/ ctx[8]);
    			toggle_class(button, "card", /*card*/ ctx[11]);
    			toggle_class(button, "large", /*large*/ ctx[10]);
    			toggle_class(button, "small", /*small*/ ctx[9]);
    			toggle_class(button, "image", /*image*/ ctx[0]);
    			toggle_class(button, "center", /*center*/ ctx[14]);
    			toggle_class(button, "width", /*width*/ ctx[13]);
    			toggle_class(button, "block", /*block*/ ctx[12]);
    			add_location(button, file$2, 0, 0, 0);
    			dispose = listen_dev(button, "click", /*click_handler*/ ctx[18], false, false, false);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, button, anchor);

    			if (!default_slot) {
    				append_dev(button, t0);
    			}

    			if (default_slot) {
    				default_slot.m(button, null);
    			}

    			append_dev(button, t1);
    			append_dev(button, figure);

    			if (badge_slot) {
    				badge_slot.m(figure, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (!default_slot) {
    				if ((!current || dirty & /*label*/ 2) && t0_value !== (t0_value = (/*label*/ ctx[1] || "") + "")) set_data_dev(t0, t0_value);
    			}

    			if (default_slot && default_slot.p && dirty & /*$$scope*/ 65536) {
    				default_slot.p(get_slot_context(default_slot_template, ctx, /*$$scope*/ ctx[16], null), get_slot_changes(default_slot_template, /*$$scope*/ ctx[16], dirty, null));
    			}

    			if (badge_slot && badge_slot.p && dirty & /*$$scope*/ 65536) {
    				badge_slot.p(get_slot_context(badge_slot_template, ctx, /*$$scope*/ ctx[16], get_badge_slot_context), get_slot_changes(badge_slot_template, /*$$scope*/ ctx[16], dirty, get_badge_slot_changes));
    			}

    			if (!current || dirty & /*label*/ 2) {
    				attr_dev(button, "aria-label", /*label*/ ctx[1]);
    			}

    			if (!current || dirty & /*label*/ 2) {
    				attr_dev(button, "title", /*label*/ ctx[1]);
    			}

    			if (!current || dirty & /*disabled*/ 4) {
    				prop_dev(button, "disabled", /*disabled*/ ctx[2]);
    			}

    			if (!current || dirty & /*hidden*/ 8) {
    				prop_dev(button, "hidden", /*hidden*/ ctx[3]);
    			}

    			if (!current || dirty & /*style*/ 32768) {
    				attr_dev(button, "style", /*style*/ ctx[15]);
    			}

    			if (dirty & /*active*/ 16) {
    				toggle_class(button, "active", /*active*/ ctx[4]);
    			}

    			if (dirty & /*success*/ 32) {
    				toggle_class(button, "success", /*success*/ ctx[5]);
    			}

    			if (dirty & /*inverse*/ 64) {
    				toggle_class(button, "inverse", /*inverse*/ ctx[6]);
    			}

    			if (dirty & /*danger*/ 128) {
    				toggle_class(button, "danger", /*danger*/ ctx[7]);
    			}

    			if (dirty & /*clean*/ 256) {
    				toggle_class(button, "clean", /*clean*/ ctx[8]);
    			}

    			if (dirty & /*card*/ 2048) {
    				toggle_class(button, "card", /*card*/ ctx[11]);
    			}

    			if (dirty & /*large*/ 1024) {
    				toggle_class(button, "large", /*large*/ ctx[10]);
    			}

    			if (dirty & /*small*/ 512) {
    				toggle_class(button, "small", /*small*/ ctx[9]);
    			}

    			if (dirty & /*image*/ 1) {
    				toggle_class(button, "image", /*image*/ ctx[0]);
    			}

    			if (dirty & /*center*/ 16384) {
    				toggle_class(button, "center", /*center*/ ctx[14]);
    			}

    			if (dirty & /*width*/ 8192) {
    				toggle_class(button, "width", /*width*/ ctx[13]);
    			}

    			if (dirty & /*block*/ 4096) {
    				toggle_class(button, "block", /*block*/ ctx[12]);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			transition_in(badge_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			transition_out(badge_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(button);
    			if (default_slot) default_slot.d(detaching);
    			if (badge_slot) badge_slot.d(detaching);
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block: block_1,
    		id: create_fragment$2.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block_1;
    }

    function instance$2($$self, $$props, $$invalidate) {
    	let { image = null } = $$props;
    	let { label = null } = $$props;
    	let { disabled = false } = $$props;
    	let { hidden = false } = $$props;
    	let { active = false } = $$props;
    	let { success = false } = $$props;
    	let { inverse = false } = $$props;
    	let { danger = false } = $$props;
    	let { clean = false } = $$props;
    	let { small = false } = $$props;
    	let { large = false } = $$props;
    	let { card = false } = $$props;
    	let { block = false } = $$props;
    	let { width = false } = $$props;
    	let { center = false } = $$props;
    	let { style = null } = $$props;

    	const writable_props = [
    		"image",
    		"label",
    		"disabled",
    		"hidden",
    		"active",
    		"success",
    		"inverse",
    		"danger",
    		"clean",
    		"small",
    		"large",
    		"card",
    		"block",
    		"width",
    		"center",
    		"style"
    	];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Button> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;

    	function click_handler(event) {
    		bubble($$self, event);
    	}

    	$$self.$set = $$props => {
    		if ("image" in $$props) $$invalidate(0, image = $$props.image);
    		if ("label" in $$props) $$invalidate(1, label = $$props.label);
    		if ("disabled" in $$props) $$invalidate(2, disabled = $$props.disabled);
    		if ("hidden" in $$props) $$invalidate(3, hidden = $$props.hidden);
    		if ("active" in $$props) $$invalidate(4, active = $$props.active);
    		if ("success" in $$props) $$invalidate(5, success = $$props.success);
    		if ("inverse" in $$props) $$invalidate(6, inverse = $$props.inverse);
    		if ("danger" in $$props) $$invalidate(7, danger = $$props.danger);
    		if ("clean" in $$props) $$invalidate(8, clean = $$props.clean);
    		if ("small" in $$props) $$invalidate(9, small = $$props.small);
    		if ("large" in $$props) $$invalidate(10, large = $$props.large);
    		if ("card" in $$props) $$invalidate(11, card = $$props.card);
    		if ("block" in $$props) $$invalidate(12, block = $$props.block);
    		if ("width" in $$props) $$invalidate(13, width = $$props.width);
    		if ("center" in $$props) $$invalidate(14, center = $$props.center);
    		if ("style" in $$props) $$invalidate(15, style = $$props.style);
    		if ("$$scope" in $$props) $$invalidate(16, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => {
    		return {
    			image,
    			label,
    			disabled,
    			hidden,
    			active,
    			success,
    			inverse,
    			danger,
    			clean,
    			small,
    			large,
    			card,
    			block,
    			width,
    			center,
    			style
    		};
    	};

    	$$self.$inject_state = $$props => {
    		if ("image" in $$props) $$invalidate(0, image = $$props.image);
    		if ("label" in $$props) $$invalidate(1, label = $$props.label);
    		if ("disabled" in $$props) $$invalidate(2, disabled = $$props.disabled);
    		if ("hidden" in $$props) $$invalidate(3, hidden = $$props.hidden);
    		if ("active" in $$props) $$invalidate(4, active = $$props.active);
    		if ("success" in $$props) $$invalidate(5, success = $$props.success);
    		if ("inverse" in $$props) $$invalidate(6, inverse = $$props.inverse);
    		if ("danger" in $$props) $$invalidate(7, danger = $$props.danger);
    		if ("clean" in $$props) $$invalidate(8, clean = $$props.clean);
    		if ("small" in $$props) $$invalidate(9, small = $$props.small);
    		if ("large" in $$props) $$invalidate(10, large = $$props.large);
    		if ("card" in $$props) $$invalidate(11, card = $$props.card);
    		if ("block" in $$props) $$invalidate(12, block = $$props.block);
    		if ("width" in $$props) $$invalidate(13, width = $$props.width);
    		if ("center" in $$props) $$invalidate(14, center = $$props.center);
    		if ("style" in $$props) $$invalidate(15, style = $$props.style);
    	};

    	return [
    		image,
    		label,
    		disabled,
    		hidden,
    		active,
    		success,
    		inverse,
    		danger,
    		clean,
    		small,
    		large,
    		card,
    		block,
    		width,
    		center,
    		style,
    		$$scope,
    		$$slots,
    		click_handler
    	];
    }

    class Button extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$2, create_fragment$2, safe_not_equal, {
    			image: 0,
    			label: 1,
    			disabled: 2,
    			hidden: 3,
    			active: 4,
    			success: 5,
    			inverse: 6,
    			danger: 7,
    			clean: 8,
    			small: 9,
    			large: 10,
    			card: 11,
    			block: 12,
    			width: 13,
    			center: 14,
    			style: 15
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Button",
    			options,
    			id: create_fragment$2.name
    		});
    	}

    	get image() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set image(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get label() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set label(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get disabled() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set disabled(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get hidden() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set hidden(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get active() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set active(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get success() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set success(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get inverse() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set inverse(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get danger() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set danger(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get clean() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set clean(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get small() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set small(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get large() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set large(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get card() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set card(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get block() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set block(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get width() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set width(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get center() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set center(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get style() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set style(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* home/one/forui/header/Header.svelte generated by Svelte v3.16.7 */
    const file$3 = "home/one/forui/header/Header.svelte";
    const get_right_slot_changes = dirty => ({});
    const get_right_slot_context = ctx => ({});
    const get_center_slot_changes = dirty => ({});
    const get_center_slot_context = ctx => ({});

    // (2:2) <Container>
    function create_default_slot(ctx) {
    	let t0;
    	let t1;
    	let current;
    	const default_slot_template = /*$$slots*/ ctx[0].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[1], null);
    	const center_slot_template = /*$$slots*/ ctx[0].center;
    	const center_slot = create_slot(center_slot_template, ctx, /*$$scope*/ ctx[1], get_center_slot_context);
    	const right_slot_template = /*$$slots*/ ctx[0].right;
    	const right_slot = create_slot(right_slot_template, ctx, /*$$scope*/ ctx[1], get_right_slot_context);

    	const block = {
    		c: function create() {
    			if (default_slot) default_slot.c();
    			t0 = space();
    			if (center_slot) center_slot.c();
    			t1 = space();
    			if (right_slot) right_slot.c();
    		},
    		m: function mount(target, anchor) {
    			if (default_slot) {
    				default_slot.m(target, anchor);
    			}

    			insert_dev(target, t0, anchor);

    			if (center_slot) {
    				center_slot.m(target, anchor);
    			}

    			insert_dev(target, t1, anchor);

    			if (right_slot) {
    				right_slot.m(target, anchor);
    			}

    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (default_slot && default_slot.p && dirty & /*$$scope*/ 2) {
    				default_slot.p(get_slot_context(default_slot_template, ctx, /*$$scope*/ ctx[1], null), get_slot_changes(default_slot_template, /*$$scope*/ ctx[1], dirty, null));
    			}

    			if (center_slot && center_slot.p && dirty & /*$$scope*/ 2) {
    				center_slot.p(get_slot_context(center_slot_template, ctx, /*$$scope*/ ctx[1], get_center_slot_context), get_slot_changes(center_slot_template, /*$$scope*/ ctx[1], dirty, get_center_slot_changes));
    			}

    			if (right_slot && right_slot.p && dirty & /*$$scope*/ 2) {
    				right_slot.p(get_slot_context(right_slot_template, ctx, /*$$scope*/ ctx[1], get_right_slot_context), get_slot_changes(right_slot_template, /*$$scope*/ ctx[1], dirty, get_right_slot_changes));
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			transition_in(center_slot, local);
    			transition_in(right_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			transition_out(center_slot, local);
    			transition_out(right_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (default_slot) default_slot.d(detaching);
    			if (detaching) detach_dev(t0);
    			if (center_slot) center_slot.d(detaching);
    			if (detaching) detach_dev(t1);
    			if (right_slot) right_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot.name,
    		type: "slot",
    		source: "(2:2) <Container>",
    		ctx
    	});

    	return block;
    }

    function create_fragment$3(ctx) {
    	let header;
    	let current;

    	const container = new Container({
    			props: {
    				$$slots: { default: [create_default_slot] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			header = element("header");
    			create_component(container.$$.fragment);
    			attr_dev(header, "class", "svelte-dz5bw8");
    			add_location(header, file$3, 0, 0, 0);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, header, anchor);
    			mount_component(container, header, null);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const container_changes = {};

    			if (dirty & /*$$scope*/ 2) {
    				container_changes.$$scope = { dirty, ctx };
    			}

    			container.$set(container_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(container.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(container.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(header);
    			destroy_component(container);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$3.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$3($$self, $$props, $$invalidate) {
    	let { $$slots = {}, $$scope } = $$props;

    	$$self.$set = $$props => {
    		if ("$$scope" in $$props) $$invalidate(1, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => {
    		return {};
    	};

    	$$self.$inject_state = $$props => {
    		
    	};

    	return [$$slots, $$scope];
    }

    class Header extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$3, create_fragment$3, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Header",
    			options,
    			id: create_fragment$3.name
    		});
    	}
    }

    const subscriber_queue = [];
    /**
     * Create a `Writable` store that allows both updating and reading by subscription.
     * @param {*=}value initial value
     * @param {StartStopNotifier=}start start and stop notifications for subscriptions
     */
    function writable(value, start = noop) {
        let stop;
        const subscribers = [];
        function set(new_value) {
            if (safe_not_equal(value, new_value)) {
                value = new_value;
                if (stop) { // store is ready
                    const run_queue = !subscriber_queue.length;
                    for (let i = 0; i < subscribers.length; i += 1) {
                        const s = subscribers[i];
                        s[1]();
                        subscriber_queue.push(s, value);
                    }
                    if (run_queue) {
                        for (let i = 0; i < subscriber_queue.length; i += 2) {
                            subscriber_queue[i][0](subscriber_queue[i + 1]);
                        }
                        subscriber_queue.length = 0;
                    }
                }
            }
        }
        function update(fn) {
            set(fn(value));
        }
        function subscribe(run, invalidate = noop) {
            const subscriber = [run, invalidate];
            subscribers.push(subscriber);
            if (subscribers.length === 1) {
                stop = start(set) || noop;
            }
            run(value);
            return () => {
                const index = subscribers.indexOf(subscriber);
                if (index !== -1) {
                    subscribers.splice(index, 1);
                }
                if (subscribers.length === 0) {
                    stop();
                    stop = null;
                }
            };
        }
        return { set, update, subscribe };
    }

    /* home/one/forui/other/Slider.svelte generated by Svelte v3.16.7 */
    const file$4 = "home/one/forui/other/Slider.svelte";

    // (5:0) {:else}
    function create_else_block(ctx) {
    	let div;
    	let current;
    	let dispose;
    	const default_slot_template = /*$$slots*/ ctx[10].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[9], null);

    	const block = {
    		c: function create() {
    			div = element("div");
    			if (default_slot) default_slot.c();
    			attr_dev(div, "class", "svelte-11om7ek");
    			toggle_class(div, "scroll", /*$isScroll*/ ctx[4]);
    			add_location(div, file$4, 5, 2, 65);

    			dispose = [
    				listen_dev(div, "mousedown", /*mousedown_handler*/ ctx[12], false, false, false),
    				listen_dev(div, "mouseup", /*mouseup_handler*/ ctx[13], false, false, false),
    				listen_dev(div, "mouseleave", /*mouseleave_handler*/ ctx[14], false, false, false),
    				listen_dev(div, "mousemove", /*mousemove_handler*/ ctx[15], false, false, false)
    			];
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			if (default_slot) {
    				default_slot.m(div, null);
    			}

    			/*div_binding*/ ctx[11](div);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (default_slot && default_slot.p && dirty & /*$$scope*/ 512) {
    				default_slot.p(get_slot_context(default_slot_template, ctx, /*$$scope*/ ctx[9], null), get_slot_changes(default_slot_template, /*$$scope*/ ctx[9], dirty, null));
    			}

    			if (dirty & /*$isScroll*/ 16) {
    				toggle_class(div, "scroll", /*$isScroll*/ ctx[4]);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (default_slot) default_slot.d(detaching);
    			/*div_binding*/ ctx[11](null);
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block.name,
    		type: "else",
    		source: "(5:0) {:else}",
    		ctx
    	});

    	return block;
    }

    // (1:0) {#if window.orientation}
    function create_if_block(ctx) {
    	let div;
    	let current;
    	const default_slot_template = /*$$slots*/ ctx[10].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[9], null);

    	const block = {
    		c: function create() {
    			div = element("div");
    			if (default_slot) default_slot.c();
    			attr_dev(div, "class", "svelte-11om7ek");
    			add_location(div, file$4, 1, 2, 27);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			if (default_slot) {
    				default_slot.m(div, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (default_slot && default_slot.p && dirty & /*$$scope*/ 512) {
    				default_slot.p(get_slot_context(default_slot_template, ctx, /*$$scope*/ ctx[9], null), get_slot_changes(default_slot_template, /*$$scope*/ ctx[9], dirty, null));
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (default_slot) default_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block.name,
    		type: "if",
    		source: "(1:0) {#if window.orientation}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$4(ctx) {
    	let current_block_type_index;
    	let if_block;
    	let if_block_anchor;
    	let current;
    	const if_block_creators = [create_if_block, create_else_block];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (window.orientation) return 0;
    		return 1;
    	}

    	current_block_type_index = select_block_type();
    	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

    	const block = {
    		c: function create() {
    			if_block.c();
    			if_block_anchor = empty();
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if_blocks[current_block_type_index].m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if_block.p(ctx, dirty);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if_blocks[current_block_type_index].d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$4.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$4($$self, $$props, $$invalidate) {
    	let $isScroll;
    	let ready = false;
    	const isScroll = writable(false);
    	validate_store(isScroll, "isScroll");
    	component_subscribe($$self, isScroll, value => $$invalidate(4, $isScroll = value));
    	let slider;
    	let startX = null;
    	let scrollLeft = null;

    	let reset = () => {
    		
    	};

    	let click = () => {
    		
    	};

    	let scroll = () => {
    		
    	};

    	onMount(() => {
    		if (window.orientation) return;

    		$$invalidate(1, reset = () => {
    			isScroll.set(false);
    			startX = null;
    			scrollLeft = null;
    			ready = false;
    		});

    		$$invalidate(2, click = (e, index) => {
    			if (slider.scrollWidth <= slider.clientWidth) return;
    			ready = true;
    			startX = e.pageX - slider.offsetLeft;
    			scrollLeft = slider.scrollLeft;
    		});

    		$$invalidate(3, scroll = (e, index) => {
    			if (!ready) return;
    			isScroll.set(true);
    			e.preventDefault();
    			const walk = e.pageX - slider.offsetLeft - startX;
    			$$invalidate(0, slider.scrollLeft = scrollLeft - walk, slider);
    		});
    	});

    	let { $$slots = {}, $$scope } = $$props;

    	function div_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			$$invalidate(0, slider = $$value);
    		});
    	}

    	const mousedown_handler = e => click(e);
    	const mouseup_handler = () => reset();
    	const mouseleave_handler = () => reset();
    	const mousemove_handler = e => scroll(e);

    	$$self.$set = $$props => {
    		if ("$$scope" in $$props) $$invalidate(9, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => {
    		return {};
    	};

    	$$self.$inject_state = $$props => {
    		if ("ready" in $$props) ready = $$props.ready;
    		if ("slider" in $$props) $$invalidate(0, slider = $$props.slider);
    		if ("startX" in $$props) startX = $$props.startX;
    		if ("scrollLeft" in $$props) scrollLeft = $$props.scrollLeft;
    		if ("reset" in $$props) $$invalidate(1, reset = $$props.reset);
    		if ("click" in $$props) $$invalidate(2, click = $$props.click);
    		if ("scroll" in $$props) $$invalidate(3, scroll = $$props.scroll);
    		if ("$isScroll" in $$props) isScroll.set($isScroll = $$props.$isScroll);
    	};

    	return [
    		slider,
    		reset,
    		click,
    		scroll,
    		$isScroll,
    		isScroll,
    		ready,
    		startX,
    		scrollLeft,
    		$$scope,
    		$$slots,
    		div_binding,
    		mousedown_handler,
    		mouseup_handler,
    		mouseleave_handler,
    		mousemove_handler
    	];
    }

    class Slider extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$4, create_fragment$4, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Slider",
    			options,
    			id: create_fragment$4.name
    		});
    	}
    }

    /* home/one/forui/input/Input.svelte generated by Svelte v3.16.7 */
    const file$5 = "home/one/forui/input/Input.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[35] = list[i];
    	return child_ctx;
    }

    // (26:4) {#if type === 'text'}
    function create_if_block_1(ctx) {
    	let t_value = (/*max*/ ctx[15]
    	? `(${/*length*/ ctx[18]}/${/*max*/ ctx[15]})`
    	: "") + "";

    	let t;

    	const block_1 = {
    		c: function create() {
    			t = text(t_value);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*max, length*/ 294912 && t_value !== (t_value = (/*max*/ ctx[15]
    			? `(${/*length*/ ctx[18]}/${/*max*/ ctx[15]})`
    			: "") + "")) set_data_dev(t, t_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block: block_1,
    		id: create_if_block_1.name,
    		type: "if",
    		source: "(26:4) {#if type === 'text'}",
    		ctx
    	});

    	return block_1;
    }

    // (28:2) {#if hints && filtered.length && !~hints.indexOf(value)}
    function create_if_block$1(ctx) {
    	let figure;
    	let each_value = /*filtered*/ ctx[19];
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
    	}

    	const block_1 = {
    		c: function create() {
    			figure = element("figure");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(figure, "class", "svelte-4pj98e");
    			add_location(figure, file$5, 28, 4, 725);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, figure, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(figure, null);
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*bubbleEmu, filtered*/ 4718592) {
    				each_value = /*filtered*/ ctx[19];
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(figure, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(figure);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block: block_1,
    		id: create_if_block$1.name,
    		type: "if",
    		source: "(28:2) {#if hints && filtered.length && !~hints.indexOf(value)}",
    		ctx
    	});

    	return block_1;
    }

    // (30:6) {#each filtered as hint}
    function create_each_block(ctx) {
    	let span;
    	let t_value = /*hint*/ ctx[35] + "";
    	let t;
    	let dispose;

    	function click_handler(...args) {
    		return /*click_handler*/ ctx[34](/*hint*/ ctx[35], ...args);
    	}

    	const block_1 = {
    		c: function create() {
    			span = element("span");
    			t = text(t_value);
    			attr_dev(span, "class", "svelte-4pj98e");
    			add_location(span, file$5, 30, 8, 773);
    			dispose = listen_dev(span, "click", click_handler, false, false, false);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    			append_dev(span, t);
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			if (dirty[0] & /*filtered*/ 524288 && t_value !== (t_value = /*hint*/ ctx[35] + "")) set_data_dev(t, t_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block: block_1,
    		id: create_each_block.name,
    		type: "each",
    		source: "(30:6) {#each filtered as hint}",
    		ctx
    	});

    	return block_1;
    }

    function create_fragment$5(ctx) {
    	let div;
    	let input_1;
    	let input_1_value_value;
    	let input_1_min_value;
    	let input_1_max_value;
    	let input_1_maxlength_value;
    	let t0;
    	let label_1;
    	let t1_value = (/*label*/ ctx[0] || "") + "";
    	let t1;
    	let t2;
    	let t3;
    	let show_if = /*hints*/ ctx[11] && /*filtered*/ ctx[19].length && !~/*hints*/ ctx[11].indexOf(/*value*/ ctx[13]);
    	let t4;
    	let current;
    	let dispose;
    	let if_block0 = /*type*/ ctx[12] === "text" && create_if_block_1(ctx);
    	let if_block1 = show_if && create_if_block$1(ctx);
    	const default_slot_template = /*$$slots*/ ctx[27].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[26], null);

    	const block_1 = {
    		c: function create() {
    			div = element("div");
    			input_1 = element("input");
    			t0 = space();
    			label_1 = element("label");
    			t1 = text(t1_value);
    			t2 = space();
    			if (if_block0) if_block0.c();
    			t3 = space();
    			if (if_block1) if_block1.c();
    			t4 = space();
    			if (default_slot) default_slot.c();
    			attr_dev(input_1, "type", /*type*/ ctx[12]);
    			input_1.value = input_1_value_value = /*format*/ ctx[20](/*value*/ ctx[13]);

    			attr_dev(input_1, "min", input_1_min_value = /*min*/ ctx[14]
    			? /*range*/ ctx[21](/*min*/ ctx[14])
    			: null);

    			attr_dev(input_1, "max", input_1_max_value = /*max*/ ctx[15]
    			? /*range*/ ctx[21](/*max*/ ctx[15])
    			: null);

    			attr_dev(input_1, "maxlength", input_1_maxlength_value = /*type*/ ctx[12] === "text" && /*max*/ ctx[15]
    			? /*max*/ ctx[15]
    			: null);

    			attr_dev(input_1, "placeholder", /*label*/ ctx[0]);
    			attr_dev(input_1, "aria-label", /*label*/ ctx[0]);
    			input_1.disabled = /*disabled*/ ctx[1];
    			input_1.hidden = /*hidden*/ ctx[2];
    			input_1.required = /*required*/ ctx[10];
    			input_1.autofocus = /*autofocus*/ ctx[16];
    			attr_dev(input_1, "class", "svelte-4pj98e");
    			toggle_class(input_1, "valid", /*valid*/ ctx[3]);
    			toggle_class(input_1, "invalid", /*invalid*/ ctx[4]);
    			toggle_class(input_1, "clean", /*clean*/ ctx[5]);
    			toggle_class(input_1, "simple", /*simple*/ ctx[6]);
    			add_location(input_1, file$5, 1, 2, 44);
    			attr_dev(label_1, "class", "svelte-4pj98e");
    			toggle_class(label_1, "active", /*value*/ ctx[13] || /*value*/ ctx[13] === 0);
    			add_location(label_1, file$5, 23, 2, 525);
    			attr_dev(div, "class", "svelte-4pj98e");
    			toggle_class(div, "block", /*block*/ ctx[7]);
    			toggle_class(div, "small", /*small*/ ctx[8]);
    			toggle_class(div, "large", /*large*/ ctx[9]);
    			add_location(div, file$5, 0, 0, 0);

    			dispose = [
    				listen_dev(input_1, "focus", /*focus_handler*/ ctx[28], false, false, false),
    				listen_dev(input_1, "blur", /*blur_handler*/ ctx[29], false, false, false),
    				listen_dev(input_1, "input", /*input_handler*/ ctx[31], false, false, false),
    				listen_dev(input_1, "change", /*change_handler*/ ctx[32], false, false, false),
    				listen_dev(input_1, "keydown", /*keydown_handler*/ ctx[33], false, false, false)
    			];
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, input_1);
    			/*input_1_binding*/ ctx[30](input_1);
    			append_dev(div, t0);
    			append_dev(div, label_1);
    			append_dev(label_1, t1);
    			append_dev(label_1, t2);
    			if (if_block0) if_block0.m(label_1, null);
    			append_dev(div, t3);
    			if (if_block1) if_block1.m(div, null);
    			append_dev(div, t4);

    			if (default_slot) {
    				default_slot.m(div, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (!current || dirty[0] & /*type*/ 4096) {
    				attr_dev(input_1, "type", /*type*/ ctx[12]);
    			}

    			if (!current || dirty[0] & /*value*/ 8192 && input_1_value_value !== (input_1_value_value = /*format*/ ctx[20](/*value*/ ctx[13]))) {
    				prop_dev(input_1, "value", input_1_value_value);
    			}

    			if (!current || dirty[0] & /*min*/ 16384 && input_1_min_value !== (input_1_min_value = /*min*/ ctx[14]
    			? /*range*/ ctx[21](/*min*/ ctx[14])
    			: null)) {
    				attr_dev(input_1, "min", input_1_min_value);
    			}

    			if (!current || dirty[0] & /*max*/ 32768 && input_1_max_value !== (input_1_max_value = /*max*/ ctx[15]
    			? /*range*/ ctx[21](/*max*/ ctx[15])
    			: null)) {
    				attr_dev(input_1, "max", input_1_max_value);
    			}

    			if (!current || dirty[0] & /*type, max*/ 36864 && input_1_maxlength_value !== (input_1_maxlength_value = /*type*/ ctx[12] === "text" && /*max*/ ctx[15]
    			? /*max*/ ctx[15]
    			: null)) {
    				attr_dev(input_1, "maxlength", input_1_maxlength_value);
    			}

    			if (!current || dirty[0] & /*label*/ 1) {
    				attr_dev(input_1, "placeholder", /*label*/ ctx[0]);
    			}

    			if (!current || dirty[0] & /*label*/ 1) {
    				attr_dev(input_1, "aria-label", /*label*/ ctx[0]);
    			}

    			if (!current || dirty[0] & /*disabled*/ 2) {
    				prop_dev(input_1, "disabled", /*disabled*/ ctx[1]);
    			}

    			if (!current || dirty[0] & /*hidden*/ 4) {
    				prop_dev(input_1, "hidden", /*hidden*/ ctx[2]);
    			}

    			if (!current || dirty[0] & /*required*/ 1024) {
    				prop_dev(input_1, "required", /*required*/ ctx[10]);
    			}

    			if (!current || dirty[0] & /*autofocus*/ 65536) {
    				prop_dev(input_1, "autofocus", /*autofocus*/ ctx[16]);
    			}

    			if (dirty[0] & /*valid*/ 8) {
    				toggle_class(input_1, "valid", /*valid*/ ctx[3]);
    			}

    			if (dirty[0] & /*invalid*/ 16) {
    				toggle_class(input_1, "invalid", /*invalid*/ ctx[4]);
    			}

    			if (dirty[0] & /*clean*/ 32) {
    				toggle_class(input_1, "clean", /*clean*/ ctx[5]);
    			}

    			if (dirty[0] & /*simple*/ 64) {
    				toggle_class(input_1, "simple", /*simple*/ ctx[6]);
    			}

    			if ((!current || dirty[0] & /*label*/ 1) && t1_value !== (t1_value = (/*label*/ ctx[0] || "") + "")) set_data_dev(t1, t1_value);

    			if (/*type*/ ctx[12] === "text") {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);
    				} else {
    					if_block0 = create_if_block_1(ctx);
    					if_block0.c();
    					if_block0.m(label_1, null);
    				}
    			} else if (if_block0) {
    				if_block0.d(1);
    				if_block0 = null;
    			}

    			if (dirty[0] & /*value*/ 8192) {
    				toggle_class(label_1, "active", /*value*/ ctx[13] || /*value*/ ctx[13] === 0);
    			}

    			if (dirty[0] & /*hints, filtered, value*/ 534528) show_if = /*hints*/ ctx[11] && /*filtered*/ ctx[19].length && !~/*hints*/ ctx[11].indexOf(/*value*/ ctx[13]);

    			if (show_if) {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);
    				} else {
    					if_block1 = create_if_block$1(ctx);
    					if_block1.c();
    					if_block1.m(div, t4);
    				}
    			} else if (if_block1) {
    				if_block1.d(1);
    				if_block1 = null;
    			}

    			if (default_slot && default_slot.p && dirty[0] & /*$$scope*/ 67108864) {
    				default_slot.p(get_slot_context(default_slot_template, ctx, /*$$scope*/ ctx[26], null), get_slot_changes(default_slot_template, /*$$scope*/ ctx[26], dirty, null));
    			}

    			if (dirty[0] & /*block*/ 128) {
    				toggle_class(div, "block", /*block*/ ctx[7]);
    			}

    			if (dirty[0] & /*small*/ 256) {
    				toggle_class(div, "small", /*small*/ ctx[8]);
    			}

    			if (dirty[0] & /*large*/ 512) {
    				toggle_class(div, "large", /*large*/ ctx[9]);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			/*input_1_binding*/ ctx[30](null);
    			if (if_block0) if_block0.d();
    			if (if_block1) if_block1.d();
    			if (default_slot) default_slot.d(detaching);
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block: block_1,
    		id: create_fragment$5.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block_1;
    }

    function instance$5($$self, $$props, $$invalidate) {
    	const dispatch = createEventDispatcher();
    	let { label = null } = $$props;
    	let { disabled = false } = $$props;
    	let { hidden = false } = $$props;
    	let { valid = false } = $$props;
    	let { invalid = false } = $$props;
    	let { clean = false } = $$props;
    	let { simple = false } = $$props;
    	let { block = false } = $$props;
    	let { small = false } = $$props;
    	let { large = false } = $$props;
    	let { required = false } = $$props;
    	let { hints = null } = $$props;
    	let { type = "text" } = $$props;
    	let { value = "" } = $$props;
    	let { min = null } = $$props;
    	let { max = null } = $$props;
    	let { autofocus = false } = $$props;
    	let input = null;
    	let length = 0;

    	const format = value => {
    		switch (type) {
    			case "date":
    				return +value > 0
    				? new Date(+value).toLocaleDateString("en-GB").split("/").reverse().join("-")
    				: "";
    			case "number":
    				return +value || null;
    			default:
    				value = value || "";
    				$$invalidate(18, length = value.length);
    				return max ? value.slice(0, max) : value;
    		}
    	};

    	const range = value => {
    		switch (type) {
    			case "date":
    				return value ? format(value) : "";
    			case "number":
    				return value || "";
    			default:
    				return null;
    		}
    	};

    	const bubbleEmu = value => {
    		if (input) input.focus();
    		bubble$1({ type: "input", target: { value } });
    	};

    	const bubble$1 = e => {
    		const target = e.target.value;
    		let value;

    		switch (type) {
    			case "date":
    				value = target ? new Date(target).getTime() : null;
    				break;
    			case "number":
    				value = +target || 0;
    				break;
    			default:
    				value = max ? target.slice(0, max) : target;
    		}

    		dispatch(e.type, value);
    	};

    	const enter = e => {
    		if (e.keyCode !== 13) return;
    		e.preventDefault();
    		dispatch("enter");
    	};

    	const writable_props = [
    		"label",
    		"disabled",
    		"hidden",
    		"valid",
    		"invalid",
    		"clean",
    		"simple",
    		"block",
    		"small",
    		"large",
    		"required",
    		"hints",
    		"type",
    		"value",
    		"min",
    		"max",
    		"autofocus"
    	];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Input> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;

    	function focus_handler(event) {
    		bubble($$self, event);
    	}

    	function blur_handler(event) {
    		bubble($$self, event);
    	}

    	function input_1_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			$$invalidate(17, input = $$value);
    		});
    	}

    	const input_handler = e => bubble$1(e);
    	const change_handler = e => bubble$1(e);
    	const keydown_handler = e => enter(e);
    	const click_handler = hint => bubbleEmu(hint);

    	$$self.$set = $$props => {
    		if ("label" in $$props) $$invalidate(0, label = $$props.label);
    		if ("disabled" in $$props) $$invalidate(1, disabled = $$props.disabled);
    		if ("hidden" in $$props) $$invalidate(2, hidden = $$props.hidden);
    		if ("valid" in $$props) $$invalidate(3, valid = $$props.valid);
    		if ("invalid" in $$props) $$invalidate(4, invalid = $$props.invalid);
    		if ("clean" in $$props) $$invalidate(5, clean = $$props.clean);
    		if ("simple" in $$props) $$invalidate(6, simple = $$props.simple);
    		if ("block" in $$props) $$invalidate(7, block = $$props.block);
    		if ("small" in $$props) $$invalidate(8, small = $$props.small);
    		if ("large" in $$props) $$invalidate(9, large = $$props.large);
    		if ("required" in $$props) $$invalidate(10, required = $$props.required);
    		if ("hints" in $$props) $$invalidate(11, hints = $$props.hints);
    		if ("type" in $$props) $$invalidate(12, type = $$props.type);
    		if ("value" in $$props) $$invalidate(13, value = $$props.value);
    		if ("min" in $$props) $$invalidate(14, min = $$props.min);
    		if ("max" in $$props) $$invalidate(15, max = $$props.max);
    		if ("autofocus" in $$props) $$invalidate(16, autofocus = $$props.autofocus);
    		if ("$$scope" in $$props) $$invalidate(26, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => {
    		return {
    			label,
    			disabled,
    			hidden,
    			valid,
    			invalid,
    			clean,
    			simple,
    			block,
    			small,
    			large,
    			required,
    			hints,
    			type,
    			value,
    			min,
    			max,
    			autofocus,
    			input,
    			length,
    			filtered
    		};
    	};

    	$$self.$inject_state = $$props => {
    		if ("label" in $$props) $$invalidate(0, label = $$props.label);
    		if ("disabled" in $$props) $$invalidate(1, disabled = $$props.disabled);
    		if ("hidden" in $$props) $$invalidate(2, hidden = $$props.hidden);
    		if ("valid" in $$props) $$invalidate(3, valid = $$props.valid);
    		if ("invalid" in $$props) $$invalidate(4, invalid = $$props.invalid);
    		if ("clean" in $$props) $$invalidate(5, clean = $$props.clean);
    		if ("simple" in $$props) $$invalidate(6, simple = $$props.simple);
    		if ("block" in $$props) $$invalidate(7, block = $$props.block);
    		if ("small" in $$props) $$invalidate(8, small = $$props.small);
    		if ("large" in $$props) $$invalidate(9, large = $$props.large);
    		if ("required" in $$props) $$invalidate(10, required = $$props.required);
    		if ("hints" in $$props) $$invalidate(11, hints = $$props.hints);
    		if ("type" in $$props) $$invalidate(12, type = $$props.type);
    		if ("value" in $$props) $$invalidate(13, value = $$props.value);
    		if ("min" in $$props) $$invalidate(14, min = $$props.min);
    		if ("max" in $$props) $$invalidate(15, max = $$props.max);
    		if ("autofocus" in $$props) $$invalidate(16, autofocus = $$props.autofocus);
    		if ("input" in $$props) $$invalidate(17, input = $$props.input);
    		if ("length" in $$props) $$invalidate(18, length = $$props.length);
    		if ("filtered" in $$props) $$invalidate(19, filtered = $$props.filtered);
    	};

    	let filtered;

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty[0] & /*hints, value*/ 10240) {
    			 $$invalidate(19, filtered = (hints || []).filter(hint => ~hint.toUpperCase().indexOf((value || "").toUpperCase())));
    		}
    	};

    	return [
    		label,
    		disabled,
    		hidden,
    		valid,
    		invalid,
    		clean,
    		simple,
    		block,
    		small,
    		large,
    		required,
    		hints,
    		type,
    		value,
    		min,
    		max,
    		autofocus,
    		input,
    		length,
    		filtered,
    		format,
    		range,
    		bubbleEmu,
    		bubble$1,
    		enter,
    		dispatch,
    		$$scope,
    		$$slots,
    		focus_handler,
    		blur_handler,
    		input_1_binding,
    		input_handler,
    		change_handler,
    		keydown_handler,
    		click_handler
    	];
    }

    class Input extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(
    			this,
    			options,
    			instance$5,
    			create_fragment$5,
    			safe_not_equal,
    			{
    				label: 0,
    				disabled: 1,
    				hidden: 2,
    				valid: 3,
    				invalid: 4,
    				clean: 5,
    				simple: 6,
    				block: 7,
    				small: 8,
    				large: 9,
    				required: 10,
    				hints: 11,
    				type: 12,
    				value: 13,
    				min: 14,
    				max: 15,
    				autofocus: 16
    			},
    			[-1, -1]
    		);

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Input",
    			options,
    			id: create_fragment$5.name
    		});
    	}

    	get label() {
    		throw new Error("<Input>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set label(value) {
    		throw new Error("<Input>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get disabled() {
    		throw new Error("<Input>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set disabled(value) {
    		throw new Error("<Input>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get hidden() {
    		throw new Error("<Input>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set hidden(value) {
    		throw new Error("<Input>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get valid() {
    		throw new Error("<Input>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set valid(value) {
    		throw new Error("<Input>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get invalid() {
    		throw new Error("<Input>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set invalid(value) {
    		throw new Error("<Input>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get clean() {
    		throw new Error("<Input>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set clean(value) {
    		throw new Error("<Input>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get simple() {
    		throw new Error("<Input>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set simple(value) {
    		throw new Error("<Input>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get block() {
    		throw new Error("<Input>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set block(value) {
    		throw new Error("<Input>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get small() {
    		throw new Error("<Input>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set small(value) {
    		throw new Error("<Input>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get large() {
    		throw new Error("<Input>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set large(value) {
    		throw new Error("<Input>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get required() {
    		throw new Error("<Input>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set required(value) {
    		throw new Error("<Input>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get hints() {
    		throw new Error("<Input>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set hints(value) {
    		throw new Error("<Input>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get type() {
    		throw new Error("<Input>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set type(value) {
    		throw new Error("<Input>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get value() {
    		throw new Error("<Input>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set value(value) {
    		throw new Error("<Input>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get min() {
    		throw new Error("<Input>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set min(value) {
    		throw new Error("<Input>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get max() {
    		throw new Error("<Input>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set max(value) {
    		throw new Error("<Input>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get autofocus() {
    		throw new Error("<Input>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set autofocus(value) {
    		throw new Error("<Input>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* home/one/forui/main/Main.svelte generated by Svelte v3.16.7 */
    const file$6 = "home/one/forui/main/Main.svelte";

    // (2:2) <Container scrolly>
    function create_default_slot$1(ctx) {
    	let current;
    	const default_slot_template = /*$$slots*/ ctx[0].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[1], null);

    	const block = {
    		c: function create() {
    			if (default_slot) default_slot.c();
    		},
    		m: function mount(target, anchor) {
    			if (default_slot) {
    				default_slot.m(target, anchor);
    			}

    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (default_slot && default_slot.p && dirty & /*$$scope*/ 2) {
    				default_slot.p(get_slot_context(default_slot_template, ctx, /*$$scope*/ ctx[1], null), get_slot_changes(default_slot_template, /*$$scope*/ ctx[1], dirty, null));
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (default_slot) default_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$1.name,
    		type: "slot",
    		source: "(2:2) <Container scrolly>",
    		ctx
    	});

    	return block;
    }

    function create_fragment$6(ctx) {
    	let main;
    	let current;

    	const container = new Container({
    			props: {
    				scrolly: true,
    				$$slots: { default: [create_default_slot$1] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			main = element("main");
    			create_component(container.$$.fragment);
    			attr_dev(main, "class", "svelte-1xhfp1m");
    			add_location(main, file$6, 0, 0, 0);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			mount_component(container, main, null);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const container_changes = {};

    			if (dirty & /*$$scope*/ 2) {
    				container_changes.$$scope = { dirty, ctx };
    			}

    			container.$set(container_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(container.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(container.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    			destroy_component(container);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$6.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$6($$self, $$props, $$invalidate) {
    	let { $$slots = {}, $$scope } = $$props;

    	$$self.$set = $$props => {
    		if ("$$scope" in $$props) $$invalidate(1, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => {
    		return {};
    	};

    	$$self.$inject_state = $$props => {
    		
    	};

    	return [$$slots, $$scope];
    }

    class Main extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$6, create_fragment$6, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Main",
    			options,
    			id: create_fragment$6.name
    		});
    	}
    }

    const current = () => {
      const [action, param] = location.hash.slice(1).split('?');

      return { action, param }
    };

    const go = (action, param) => {
      let hash = action || "";
      if (param) hash += '?' + param;
      location.hash = hash;
    };

    const { subscribe: subscribe$1, set } = writable(current());

    window.addEventListener("hashchange", () => set(current()));

    var router = { subscribe: subscribe$1, go };

    const persist = (name, value) => {
      const stored = localStorage.getItem(name);
      value = writable(!stored ? value : JSON.parse(stored));
      value.subscribe(value => {
        if (value !== undefined) {
          localStorage.setItem(name, JSON.stringify(value));
        }
      });
      return value
    };

    const { subscribe: subscribe$2, update: update$1 } = persist('myLinks', {});

    const add = link =>
      update$1(links => {
        links[link.id] = link;
        return { ...links }
      });

    const del = id =>
      update$1(links => {
        delete links[id];
        return { ...links }
      });

    var links = {
      subscribe: subscribe$2,
      add,
      del
    };

    /* src/Create.svelte generated by Svelte v3.16.7 */
    const file$7 = "src/Create.svelte";

    // (15:4) <Button       on:click={() => (url = clipboard)}       hidden={!clipboard || url}       label="< {clipboard}"       clean       large     >
    function create_default_slot_5(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("paste");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_5.name,
    		type: "slot",
    		source: "(15:4) <Button       on:click={() => (url = clipboard)}       hidden={!clipboard || url}       label=\\\"< {clipboard}\\\"       clean       large     >",
    		ctx
    	});

    	return block;
    }

    // (24:4) <Button       on:click={() => (url = "")}       hidden={!url}       danger={message.url}       label="clear"       large     >
    function create_default_slot_4(ctx) {
    	let t_value = (/*message*/ ctx[2].url ? "!" : "x") + "";
    	let t;

    	const block = {
    		c: function create() {
    			t = text(t_value);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*message*/ 4 && t_value !== (t_value = (/*message*/ ctx[2].url ? "!" : "x") + "")) set_data_dev(t, t_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_4.name,
    		type: "slot",
    		source: "(24:4) <Button       on:click={() => (url = \\\"\\\")}       hidden={!url}       danger={message.url}       label=\\\"clear\\\"       large     >",
    		ctx
    	});

    	return block;
    }

    // (6:2) <Input     block     large     label={message.url || "Enter URL you want to shorten, e.g. http://example.com"}     on:input={(e) => (url = e.detail)}     value={url}     on:enter={() => submit()}     invalid={message.url}   >
    function create_default_slot_3(ctx) {
    	let t;
    	let current;

    	const button0 = new Button({
    			props: {
    				hidden: !/*clipboard*/ ctx[3] || /*url*/ ctx[0],
    				label: "< " + /*clipboard*/ ctx[3],
    				clean: true,
    				large: true,
    				$$slots: { default: [create_default_slot_5] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	button0.$on("click", /*click_handler*/ ctx[10]);

    	const button1 = new Button({
    			props: {
    				hidden: !/*url*/ ctx[0],
    				danger: /*message*/ ctx[2].url,
    				label: "clear",
    				large: true,
    				$$slots: { default: [create_default_slot_4] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	button1.$on("click", /*click_handler_1*/ ctx[11]);

    	const block = {
    		c: function create() {
    			create_component(button0.$$.fragment);
    			t = space();
    			create_component(button1.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(button0, target, anchor);
    			insert_dev(target, t, anchor);
    			mount_component(button1, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const button0_changes = {};
    			if (dirty & /*clipboard, url*/ 9) button0_changes.hidden = !/*clipboard*/ ctx[3] || /*url*/ ctx[0];
    			if (dirty & /*clipboard*/ 8) button0_changes.label = "< " + /*clipboard*/ ctx[3];

    			if (dirty & /*$$scope*/ 262144) {
    				button0_changes.$$scope = { dirty, ctx };
    			}

    			button0.$set(button0_changes);
    			const button1_changes = {};
    			if (dirty & /*url*/ 1) button1_changes.hidden = !/*url*/ ctx[0];
    			if (dirty & /*message*/ 4) button1_changes.danger = /*message*/ ctx[2].url;

    			if (dirty & /*$$scope, message*/ 262148) {
    				button1_changes.$$scope = { dirty, ctx };
    			}

    			button1.$set(button1_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(button0.$$.fragment, local);
    			transition_in(button1.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(button0.$$.fragment, local);
    			transition_out(button1.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(button0, detaching);
    			if (detaching) detach_dev(t);
    			destroy_component(button1, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_3.name,
    		type: "slot",
    		source: "(6:2) <Input     block     large     label={message.url || \\\"Enter URL you want to shorten, e.g. http://example.com\\\"}     on:input={(e) => (url = e.detail)}     value={url}     on:enter={() => submit()}     invalid={message.url}   >",
    		ctx
    	});

    	return block;
    }

    // (44:4) <Button       on:click={() => (mail = "")}       hidden={!mail}       danger={message.mail}       label="clear"       large     >
    function create_default_slot_2(ctx) {
    	let t_value = (/*message*/ ctx[2].mail ? "!" : "x") + "";
    	let t;

    	const block = {
    		c: function create() {
    			t = text(t_value);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*message*/ 4 && t_value !== (t_value = (/*message*/ ctx[2].mail ? "!" : "x") + "")) set_data_dev(t, t_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_2.name,
    		type: "slot",
    		source: "(44:4) <Button       on:click={() => (mail = \\\"\\\")}       hidden={!mail}       danger={message.mail}       label=\\\"clear\\\"       large     >",
    		ctx
    	});

    	return block;
    }

    // (34:2) <Input     block     large     label={message.mail || "You can specify your email, to edit this link in future"}     on:input={(e) => (mail = e.detail)}     value={mail}     hints={emails()}     on:enter={() => submit()}     invalid={message.mail}   >
    function create_default_slot_1(ctx) {
    	let current;

    	const button = new Button({
    			props: {
    				hidden: !/*mail*/ ctx[1],
    				danger: /*message*/ ctx[2].mail,
    				label: "clear",
    				large: true,
    				$$slots: { default: [create_default_slot_2] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	button.$on("click", /*click_handler_2*/ ctx[14]);

    	const block = {
    		c: function create() {
    			create_component(button.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(button, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const button_changes = {};
    			if (dirty & /*mail*/ 2) button_changes.hidden = !/*mail*/ ctx[1];
    			if (dirty & /*message*/ 4) button_changes.danger = /*message*/ ctx[2].mail;

    			if (dirty & /*$$scope, message*/ 262148) {
    				button_changes.$$scope = { dirty, ctx };
    			}

    			button.$set(button_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(button.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(button.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(button, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_1.name,
    		type: "slot",
    		source: "(34:2) <Input     block     large     label={message.mail || \\\"You can specify your email, to edit this link in future\\\"}     on:input={(e) => (mail = e.detail)}     value={mail}     hints={emails()}     on:enter={() => submit()}     invalid={message.mail}   >",
    		ctx
    	});

    	return block;
    }

    // (3:0) <Container small middle>
    function create_default_slot$2(ctx) {
    	let h2;
    	let t1;
    	let h4;
    	let t3;
    	let t4;
    	let t5;
    	let t6;
    	let p;
    	let t7_value = /*message*/ ctx[2].message + "";
    	let t7;
    	let p_hidden_value;
    	let current;

    	const input0 = new Input({
    			props: {
    				block: true,
    				large: true,
    				label: /*message*/ ctx[2].url || "Enter URL you want to shorten, e.g. http://example.com",
    				value: /*url*/ ctx[0],
    				invalid: /*message*/ ctx[2].url,
    				$$slots: { default: [create_default_slot_3] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	input0.$on("input", /*input_handler*/ ctx[12]);
    	input0.$on("enter", /*enter_handler*/ ctx[13]);

    	const input1 = new Input({
    			props: {
    				block: true,
    				large: true,
    				label: /*message*/ ctx[2].mail || "You can specify your email, to edit this link in future",
    				value: /*mail*/ ctx[1],
    				hints: /*emails*/ ctx[5](),
    				invalid: /*message*/ ctx[2].mail,
    				$$slots: { default: [create_default_slot_1] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	input1.$on("input", /*input_handler_1*/ ctx[15]);
    	input1.$on("enter", /*enter_handler_1*/ ctx[16]);

    	const button = new Button({
    			props: {
    				disabled: !/*url*/ ctx[0],
    				large: true,
    				label: /*url*/ ctx[0] ? "Let's shorten" : "URL required",
    				width: true,
    				center: true
    			},
    			$$inline: true
    		});

    	button.$on("click", /*click_handler_3*/ ctx[17]);

    	const block = {
    		c: function create() {
    			h2 = element("h2");
    			h2.textContent = "Welcome! Ready to get started?";
    			t1 = space();
    			h4 = element("h4");
    			h4.textContent = "No registration, no ads, no logs, no fee.";
    			t3 = space();
    			create_component(input0.$$.fragment);
    			t4 = space();
    			create_component(input1.$$.fragment);
    			t5 = space();
    			create_component(button.$$.fragment);
    			t6 = space();
    			p = element("p");
    			t7 = text(t7_value);
    			attr_dev(h2, "class", "svelte-xzpybw");
    			add_location(h2, file$7, 3, 2, 79);
    			attr_dev(h4, "class", "svelte-xzpybw");
    			add_location(h4, file$7, 4, 2, 121);
    			p.hidden = p_hidden_value = !/*message*/ ctx[2].message;
    			add_location(p, file$7, 61, 2, 1354);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, h2, anchor);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, h4, anchor);
    			insert_dev(target, t3, anchor);
    			mount_component(input0, target, anchor);
    			insert_dev(target, t4, anchor);
    			mount_component(input1, target, anchor);
    			insert_dev(target, t5, anchor);
    			mount_component(button, target, anchor);
    			insert_dev(target, t6, anchor);
    			insert_dev(target, p, anchor);
    			append_dev(p, t7);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const input0_changes = {};
    			if (dirty & /*message*/ 4) input0_changes.label = /*message*/ ctx[2].url || "Enter URL you want to shorten, e.g. http://example.com";
    			if (dirty & /*url*/ 1) input0_changes.value = /*url*/ ctx[0];
    			if (dirty & /*message*/ 4) input0_changes.invalid = /*message*/ ctx[2].url;

    			if (dirty & /*$$scope, url, message, clipboard*/ 262157) {
    				input0_changes.$$scope = { dirty, ctx };
    			}

    			input0.$set(input0_changes);
    			const input1_changes = {};
    			if (dirty & /*message*/ 4) input1_changes.label = /*message*/ ctx[2].mail || "You can specify your email, to edit this link in future";
    			if (dirty & /*mail*/ 2) input1_changes.value = /*mail*/ ctx[1];
    			if (dirty & /*message*/ 4) input1_changes.invalid = /*message*/ ctx[2].mail;

    			if (dirty & /*$$scope, mail, message*/ 262150) {
    				input1_changes.$$scope = { dirty, ctx };
    			}

    			input1.$set(input1_changes);
    			const button_changes = {};
    			if (dirty & /*url*/ 1) button_changes.disabled = !/*url*/ ctx[0];
    			if (dirty & /*url*/ 1) button_changes.label = /*url*/ ctx[0] ? "Let's shorten" : "URL required";
    			button.$set(button_changes);
    			if ((!current || dirty & /*message*/ 4) && t7_value !== (t7_value = /*message*/ ctx[2].message + "")) set_data_dev(t7, t7_value);

    			if (!current || dirty & /*message*/ 4 && p_hidden_value !== (p_hidden_value = !/*message*/ ctx[2].message)) {
    				prop_dev(p, "hidden", p_hidden_value);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(input0.$$.fragment, local);
    			transition_in(input1.$$.fragment, local);
    			transition_in(button.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(input0.$$.fragment, local);
    			transition_out(input1.$$.fragment, local);
    			transition_out(button.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(h2);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(h4);
    			if (detaching) detach_dev(t3);
    			destroy_component(input0, detaching);
    			if (detaching) detach_dev(t4);
    			destroy_component(input1, detaching);
    			if (detaching) detach_dev(t5);
    			destroy_component(button, detaching);
    			if (detaching) detach_dev(t6);
    			if (detaching) detach_dev(p);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$2.name,
    		type: "slot",
    		source: "(3:0) <Container small middle>",
    		ctx
    	});

    	return block;
    }

    function create_fragment$7(ctx) {
    	let current;
    	let dispose;

    	const container = new Container({
    			props: {
    				small: true,
    				middle: true,
    				$$slots: { default: [create_default_slot$2] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(container.$$.fragment);
    			dispose = listen_dev(window, "focus", /*focus_handler*/ ctx[9], false, false, false);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			mount_component(container, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const container_changes = {};

    			if (dirty & /*$$scope, message, url, mail, clipboard*/ 262159) {
    				container_changes.$$scope = { dirty, ctx };
    			}

    			container.$set(container_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(container.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(container.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(container, detaching);
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$7.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$7($$self, $$props, $$invalidate) {
    	let $links;
    	validate_store(links, "links");
    	component_subscribe($$self, links, $$value => $$invalidate(8, $links = $$value));
    	let url = "";
    	let mail = "";
    	let message = {};
    	let interval = null;
    	let clipboard = "";

    	const get_clipboard = async () => {
    		const str = await navigator.clipboard.readText();
    		if (str.startsWith("http")) $$invalidate(3, clipboard = str);
    	};

    	onMount(() => get_clipboard());

    	const emails = () => {
    		const arr = Object.values($links).map(l => l.mail).filter(m => m);
    		return [...new Set(arr)];
    	};

    	const submit = async () => {
    		if (!url) return;
    		const data = { url, mail: mail || undefined };

    		const res = await fetch("/create", {
    			method: "POST",
    			headers: { "Content-Type": "application/json" },
    			body: JSON.stringify(data)
    		});

    		if (res.status === 400) {
    			$$invalidate(2, message = await res.json());
    		} else if (res.status === 200) {
    			const link = await res.json();
    			links.add(link);
    			router.go("search", link.id);
    		} else {
    			$$invalidate(2, message = {
    				message: "Something went wrong, try again later"
    			});
    		}

    		clearInterval(interval);
    		interval = setInterval(() => $$invalidate(2, message = {}), 5000);
    	};

    	const focus_handler = () => get_clipboard();
    	const click_handler = () => $$invalidate(0, url = clipboard);
    	const click_handler_1 = () => $$invalidate(0, url = "");
    	const input_handler = e => $$invalidate(0, url = e.detail);
    	const enter_handler = () => submit();
    	const click_handler_2 = () => $$invalidate(1, mail = "");
    	const input_handler_1 = e => $$invalidate(1, mail = e.detail);
    	const enter_handler_1 = () => submit();
    	const click_handler_3 = () => submit();

    	$$self.$capture_state = () => {
    		return {};
    	};

    	$$self.$inject_state = $$props => {
    		if ("url" in $$props) $$invalidate(0, url = $$props.url);
    		if ("mail" in $$props) $$invalidate(1, mail = $$props.mail);
    		if ("message" in $$props) $$invalidate(2, message = $$props.message);
    		if ("interval" in $$props) interval = $$props.interval;
    		if ("clipboard" in $$props) $$invalidate(3, clipboard = $$props.clipboard);
    		if ("$links" in $$props) links.set($links = $$props.$links);
    	};

    	return [
    		url,
    		mail,
    		message,
    		clipboard,
    		get_clipboard,
    		emails,
    		submit,
    		interval,
    		$links,
    		focus_handler,
    		click_handler,
    		click_handler_1,
    		input_handler,
    		enter_handler,
    		click_handler_2,
    		input_handler_1,
    		enter_handler_1,
    		click_handler_3
    	];
    }

    class Create extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$7, create_fragment$7, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Create",
    			options,
    			id: create_fragment$7.name
    		});
    	}
    }

    /* src/Search.svelte generated by Svelte v3.16.7 */
    const file$8 = "src/Search.svelte";

    function get_each_context$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[18] = list[i];
    	return child_ctx;
    }

    // (16:12) <Button               on:click={() => router.go('search')}               hidden={!$router.param}               label="All"               clean               large             >
    function create_default_slot_4$1(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("x");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_4$1.name,
    		type: "slot",
    		source: "(16:12) <Button               on:click={() => router.go('search')}               hidden={!$router.param}               label=\\\"All\\\"               clean               large             >",
    		ctx
    	});

    	return block;
    }

    // (5:8) <Input           block           large           label={message.id || location.origin + '/' + ($router.param || '')}           on:input={(e) => search(e)}           value={$router.param || ''}           on:enter={() => find()}           invalid={message.id}           valid={found && found.id == $router.param}         >
    function create_default_slot_3$1(ctx) {
    	let div;
    	let t;
    	let current;

    	const button0 = new Button({
    			props: {
    				hidden: !/*$router*/ ctx[2].param,
    				label: "All",
    				clean: true,
    				large: true,
    				$$slots: { default: [create_default_slot_4$1] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	button0.$on("click", /*click_handler*/ ctx[11]);

    	const button1 = new Button({
    			props: {
    				disabled: !/*$router*/ ctx[2].param,
    				label: /*message*/ ctx[0].id ? "Not found" : "Search",
    				danger: /*message*/ ctx[0].id,
    				success: /*found*/ ctx[1] && /*found*/ ctx[1].id == /*$router*/ ctx[2].param,
    				large: true
    			},
    			$$inline: true
    		});

    	button1.$on("click", /*click_handler_1*/ ctx[12]);

    	const block = {
    		c: function create() {
    			div = element("div");
    			create_component(button0.$$.fragment);
    			t = space();
    			create_component(button1.$$.fragment);
    			add_location(div, file$8, 14, 10, 390);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			mount_component(button0, div, null);
    			append_dev(div, t);
    			mount_component(button1, div, null);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const button0_changes = {};
    			if (dirty & /*$router*/ 4) button0_changes.hidden = !/*$router*/ ctx[2].param;

    			if (dirty & /*$$scope*/ 2097152) {
    				button0_changes.$$scope = { dirty, ctx };
    			}

    			button0.$set(button0_changes);
    			const button1_changes = {};
    			if (dirty & /*$router*/ 4) button1_changes.disabled = !/*$router*/ ctx[2].param;
    			if (dirty & /*message*/ 1) button1_changes.label = /*message*/ ctx[0].id ? "Not found" : "Search";
    			if (dirty & /*message*/ 1) button1_changes.danger = /*message*/ ctx[0].id;
    			if (dirty & /*found, $router*/ 6) button1_changes.success = /*found*/ ctx[1] && /*found*/ ctx[1].id == /*$router*/ ctx[2].param;
    			button1.$set(button1_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(button0.$$.fragment, local);
    			transition_in(button1.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(button0.$$.fragment, local);
    			transition_out(button1.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_component(button0);
    			destroy_component(button1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_3$1.name,
    		type: "slot",
    		source: "(5:8) <Input           block           large           label={message.id || location.origin + '/' + ($router.param || '')}           on:input={(e) => search(e)}           value={$router.param || ''}           on:enter={() => find()}           invalid={message.id}           valid={found && found.id == $router.param}         >",
    		ctx
    	});

    	return block;
    }

    // (67:12) <Button               on:click={() => links.del(link.id)}               label="Hide"               hidden={!$links[link.id]}               clean               small             >
    function create_default_slot_2$1(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("x");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_2$1.name,
    		type: "slot",
    		source: "(67:12) <Button               on:click={() => links.del(link.id)}               label=\\\"Hide\\\"               hidden={!$links[link.id]}               clean               small             >",
    		ctx
    	});

    	return block;
    }

    // (53:10) <BtnGroup right block>
    function create_default_slot_1$1(ctx) {
    	let t0;
    	let t1;
    	let current;

    	function click_handler_2(...args) {
    		return /*click_handler_2*/ ctx[15](/*link*/ ctx[18], ...args);
    	}

    	const button0 = new Button({
    			props: { label: "Copy", clean: true, small: true },
    			$$inline: true
    		});

    	button0.$on("click", click_handler_2);

    	function click_handler_3(...args) {
    		return /*click_handler_3*/ ctx[16](/*link*/ ctx[18], ...args);
    	}

    	const button1 = new Button({
    			props: {
    				label: "Edit",
    				hidden: !/*$links*/ ctx[4][/*link*/ ctx[18].id] && !/*link*/ ctx[18].shadow,
    				clean: true,
    				small: true
    			},
    			$$inline: true
    		});

    	button1.$on("click", click_handler_3);

    	function click_handler_4(...args) {
    		return /*click_handler_4*/ ctx[17](/*link*/ ctx[18], ...args);
    	}

    	const button2 = new Button({
    			props: {
    				label: "Hide",
    				hidden: !/*$links*/ ctx[4][/*link*/ ctx[18].id],
    				clean: true,
    				small: true,
    				$$slots: { default: [create_default_slot_2$1] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	button2.$on("click", click_handler_4);

    	const block = {
    		c: function create() {
    			create_component(button0.$$.fragment);
    			t0 = space();
    			create_component(button1.$$.fragment);
    			t1 = space();
    			create_component(button2.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(button0, target, anchor);
    			insert_dev(target, t0, anchor);
    			mount_component(button1, target, anchor);
    			insert_dev(target, t1, anchor);
    			mount_component(button2, target, anchor);
    			current = true;
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			const button1_changes = {};
    			if (dirty & /*$links, links_list*/ 24) button1_changes.hidden = !/*$links*/ ctx[4][/*link*/ ctx[18].id] && !/*link*/ ctx[18].shadow;
    			button1.$set(button1_changes);
    			const button2_changes = {};
    			if (dirty & /*$links, links_list*/ 24) button2_changes.hidden = !/*$links*/ ctx[4][/*link*/ ctx[18].id];

    			if (dirty & /*$$scope*/ 2097152) {
    				button2_changes.$$scope = { dirty, ctx };
    			}

    			button2.$set(button2_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(button0.$$.fragment, local);
    			transition_in(button1.$$.fragment, local);
    			transition_in(button2.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(button0.$$.fragment, local);
    			transition_out(button1.$$.fragment, local);
    			transition_out(button2.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(button0, detaching);
    			if (detaching) detach_dev(t0);
    			destroy_component(button1, detaching);
    			if (detaching) detach_dev(t1);
    			destroy_component(button2, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_1$1.name,
    		type: "slot",
    		source: "(53:10) <BtnGroup right block>",
    		ctx
    	});

    	return block;
    }

    // (42:4) {#each links_list as link}
    function create_each_block$1(ctx) {
    	let tr;
    	let td0;
    	let a;
    	let t0_value = location.origin + "";
    	let t0;
    	let t1;
    	let t2_value = /*link*/ ctx[18].id + "";
    	let t2;
    	let a_href_value;
    	let t3;
    	let td1;
    	let span;
    	let t4_value = /*link*/ ctx[18].url + "";
    	let t4;
    	let t5;
    	let td2;
    	let t6;
    	let current;

    	const btngroup = new BtnGroup({
    			props: {
    				right: true,
    				block: true,
    				$$slots: { default: [create_default_slot_1$1] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			tr = element("tr");
    			td0 = element("td");
    			a = element("a");
    			t0 = text(t0_value);
    			t1 = text("/");
    			t2 = text(t2_value);
    			t3 = space();
    			td1 = element("td");
    			span = element("span");
    			t4 = text(t4_value);
    			t5 = space();
    			td2 = element("td");
    			create_component(btngroup.$$.fragment);
    			t6 = space();
    			attr_dev(a, "href", a_href_value = "/" + /*link*/ ctx[18].id);
    			attr_dev(a, "target", "_blank");
    			add_location(a, file$8, 44, 10, 1099);
    			attr_dev(td0, "class", "svelte-1l1iait");
    			add_location(td0, file$8, 43, 8, 1084);
    			attr_dev(span, "class", "svelte-1l1iait");
    			add_location(span, file$8, 49, 10, 1229);
    			attr_dev(td1, "class", "svelte-1l1iait");
    			add_location(td1, file$8, 48, 8, 1214);
    			attr_dev(td2, "class", "svelte-1l1iait");
    			add_location(td2, file$8, 51, 8, 1275);
    			attr_dev(tr, "class", "svelte-1l1iait");
    			add_location(tr, file$8, 42, 6, 1071);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, tr, anchor);
    			append_dev(tr, td0);
    			append_dev(td0, a);
    			append_dev(a, t0);
    			append_dev(a, t1);
    			append_dev(a, t2);
    			append_dev(tr, t3);
    			append_dev(tr, td1);
    			append_dev(td1, span);
    			append_dev(span, t4);
    			append_dev(tr, t5);
    			append_dev(tr, td2);
    			mount_component(btngroup, td2, null);
    			append_dev(tr, t6);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if ((!current || dirty & /*links_list*/ 8) && t2_value !== (t2_value = /*link*/ ctx[18].id + "")) set_data_dev(t2, t2_value);

    			if (!current || dirty & /*links_list*/ 8 && a_href_value !== (a_href_value = "/" + /*link*/ ctx[18].id)) {
    				attr_dev(a, "href", a_href_value);
    			}

    			if ((!current || dirty & /*links_list*/ 8) && t4_value !== (t4_value = /*link*/ ctx[18].url + "")) set_data_dev(t4, t4_value);
    			const btngroup_changes = {};

    			if (dirty & /*$$scope, $links, links_list*/ 2097176) {
    				btngroup_changes.$$scope = { dirty, ctx };
    			}

    			btngroup.$set(btngroup_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(btngroup.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(btngroup.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(tr);
    			destroy_component(btngroup);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$1.name,
    		type: "each",
    		source: "(42:4) {#each links_list as link}",
    		ctx
    	});

    	return block;
    }

    // (1:0) <Slider>
    function create_default_slot$3(ctx) {
    	let table;
    	let tr0;
    	let th0;
    	let t0;
    	let tr1;
    	let th1;
    	let t2;
    	let th2;
    	let t4;
    	let th3;
    	let t5;
    	let current;

    	const input = new Input({
    			props: {
    				block: true,
    				large: true,
    				label: /*message*/ ctx[0].id || location.origin + "/" + (/*$router*/ ctx[2].param || ""),
    				value: /*$router*/ ctx[2].param || "",
    				invalid: /*message*/ ctx[0].id,
    				valid: /*found*/ ctx[1] && /*found*/ ctx[1].id == /*$router*/ ctx[2].param,
    				$$slots: { default: [create_default_slot_3$1] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	input.$on("input", /*input_handler*/ ctx[13]);
    	input.$on("enter", /*enter_handler*/ ctx[14]);
    	let each_value = /*links_list*/ ctx[3];
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$1(get_each_context$1(ctx, each_value, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	const block = {
    		c: function create() {
    			table = element("table");
    			tr0 = element("tr");
    			th0 = element("th");
    			create_component(input.$$.fragment);
    			t0 = space();
    			tr1 = element("tr");
    			th1 = element("th");
    			th1.textContent = "Link";
    			t2 = space();
    			th2 = element("th");
    			th2.textContent = "To";
    			t4 = space();
    			th3 = element("th");
    			t5 = space();

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(th0, "colspan", "3");
    			attr_dev(th0, "class", "svelte-1l1iait");
    			add_location(th0, file$8, 3, 6, 34);
    			attr_dev(tr0, "class", "svelte-1l1iait");
    			add_location(tr0, file$8, 2, 4, 23);
    			attr_dev(th1, "class", "svelte-1l1iait");
    			add_location(th1, file$8, 37, 6, 976);
    			attr_dev(th2, "class", "svelte-1l1iait");
    			add_location(th2, file$8, 38, 6, 996);
    			attr_dev(th3, "class", "svelte-1l1iait");
    			add_location(th3, file$8, 39, 6, 1014);
    			attr_dev(tr1, "class", "svelte-1l1iait");
    			add_location(tr1, file$8, 36, 4, 965);
    			attr_dev(table, "class", "svelte-1l1iait");
    			add_location(table, file$8, 1, 2, 11);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, table, anchor);
    			append_dev(table, tr0);
    			append_dev(tr0, th0);
    			mount_component(input, th0, null);
    			append_dev(table, t0);
    			append_dev(table, tr1);
    			append_dev(tr1, th1);
    			append_dev(tr1, t2);
    			append_dev(tr1, th2);
    			append_dev(tr1, t4);
    			append_dev(tr1, th3);
    			append_dev(table, t5);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(table, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const input_changes = {};
    			if (dirty & /*message, $router*/ 5) input_changes.label = /*message*/ ctx[0].id || location.origin + "/" + (/*$router*/ ctx[2].param || "");
    			if (dirty & /*$router*/ 4) input_changes.value = /*$router*/ ctx[2].param || "";
    			if (dirty & /*message*/ 1) input_changes.invalid = /*message*/ ctx[0].id;
    			if (dirty & /*found, $router*/ 6) input_changes.valid = /*found*/ ctx[1] && /*found*/ ctx[1].id == /*$router*/ ctx[2].param;

    			if (dirty & /*$$scope, $router, message, found*/ 2097159) {
    				input_changes.$$scope = { dirty, ctx };
    			}

    			input.$set(input_changes);

    			if (dirty & /*$links, links_list, links, router, copy, location*/ 152) {
    				each_value = /*links_list*/ ctx[3];
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$1(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block$1(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(table, null);
    					}
    				}

    				group_outros();

    				for (i = each_value.length; i < each_blocks.length; i += 1) {
    					out(i);
    				}

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(input.$$.fragment, local);

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(input.$$.fragment, local);
    			each_blocks = each_blocks.filter(Boolean);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(table);
    			destroy_component(input);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$3.name,
    		type: "slot",
    		source: "(1:0) <Slider>",
    		ctx
    	});

    	return block;
    }

    function create_fragment$8(ctx) {
    	let current;

    	const slider = new Slider({
    			props: {
    				$$slots: { default: [create_default_slot$3] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(slider.$$.fragment);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			mount_component(slider, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const slider_changes = {};

    			if (dirty & /*$$scope, links_list, $links, message, $router, found*/ 2097183) {
    				slider_changes.$$scope = { dirty, ctx };
    			}

    			slider.$set(slider_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(slider.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(slider.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(slider, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$8.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$8($$self, $$props, $$invalidate) {
    	let $router;
    	let $links;
    	validate_store(router, "router");
    	component_subscribe($$self, router, $$value => $$invalidate(2, $router = $$value));
    	validate_store(links, "links");
    	component_subscribe($$self, links, $$value => $$invalidate(4, $links = $$value));
    	let id = $router.param || "";
    	let mail = "";
    	let message = {};
    	let interval = null;
    	let found = null;

    	const find = async () => {
    		if (!$router.param) return;

    		if ($links[$router.param]) {
    			return $$invalidate(1, found = $links[$router.param]);
    		}

    		const res = await fetch("/get/" + $router.param);

    		if (res.status == 404) {
    			$$invalidate(0, message = await res.json());
    			clearInterval(interval);
    			interval = setInterval(() => $$invalidate(0, message = {}), 2000);
    		} else if (res.status == 200) {
    			$$invalidate(1, found = await res.json());
    		}
    	};

    	onMount(() => find());

    	const search = e => {
    		const origin = location.origin + "/";
    		const id = e.detail.replace(origin, "");
    		router.go("search", id);
    	};

    	const copy = id => {
    		const url = location.origin + "/" + id;
    		navigator.clipboard.writeText(url);
    	};

    	const click_handler = () => router.go("search");
    	const click_handler_1 = () => find();
    	const input_handler = e => search(e);
    	const enter_handler = () => find();
    	const click_handler_2 = link => copy(link.id);
    	const click_handler_3 = link => router.go("edit", link.id);
    	const click_handler_4 = link => links.del(link.id);

    	$$self.$capture_state = () => {
    		return {};
    	};

    	$$self.$inject_state = $$props => {
    		if ("id" in $$props) id = $$props.id;
    		if ("mail" in $$props) mail = $$props.mail;
    		if ("message" in $$props) $$invalidate(0, message = $$props.message);
    		if ("interval" in $$props) interval = $$props.interval;
    		if ("found" in $$props) $$invalidate(1, found = $$props.found);
    		if ("$router" in $$props) router.set($router = $$props.$router);
    		if ("links_list" in $$props) $$invalidate(3, links_list = $$props.links_list);
    		if ("$links" in $$props) links.set($links = $$props.$links);
    	};

    	let links_list;

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*$router, $links, found*/ 22) {
    			 $$invalidate(3, links_list = !$router.param
    			? Object.values($links)
    			: found && $router.param == found.id ? [found] : []);
    		}
    	};

    	return [
    		message,
    		found,
    		$router,
    		links_list,
    		$links,
    		find,
    		search,
    		copy,
    		interval,
    		id,
    		mail,
    		click_handler,
    		click_handler_1,
    		input_handler,
    		enter_handler,
    		click_handler_2,
    		click_handler_3,
    		click_handler_4
    	];
    }

    class Search extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$8, create_fragment$8, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Search",
    			options,
    			id: create_fragment$8.name
    		});
    	}
    }

    /* src/Edit.svelte generated by Svelte v3.16.7 */
    const file$9 = "src/Edit.svelte";

    // (1:0) <Container small scrollx>
    function create_default_slot$4(ctx) {
    	const block = { c: noop, m: noop, d: noop };

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$4.name,
    		type: "slot",
    		source: "(1:0) <Container small scrollx>",
    		ctx
    	});

    	return block;
    }

    function create_fragment$9(ctx) {
    	let t0;
    	let pre;
    	let t1_value = JSON.stringify(/*$links*/ ctx[0], null, 2) + "";
    	let t1;
    	let pre_hidden_value;
    	let current;

    	const container = new Container({
    			props: {
    				small: true,
    				scrollx: true,
    				$$slots: { default: [create_default_slot$4] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(container.$$.fragment);
    			t0 = space();
    			pre = element("pre");
    			t1 = text(t1_value);
    			pre.hidden = pre_hidden_value = false;
    			add_location(pre, file$9, 29, 0, 691);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			mount_component(container, target, anchor);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, pre, anchor);
    			append_dev(pre, t1);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const container_changes = {};

    			if (dirty & /*$$scope*/ 64) {
    				container_changes.$$scope = { dirty, ctx };
    			}

    			container.$set(container_changes);
    			if ((!current || dirty & /*$links*/ 1) && t1_value !== (t1_value = JSON.stringify(/*$links*/ ctx[0], null, 2) + "")) set_data_dev(t1, t1_value);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(container.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(container.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(container, detaching);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(pre);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$9.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$9($$self, $$props, $$invalidate) {
    	let $links;
    	validate_store(links, "links");
    	component_subscribe($$self, links, $$value => $$invalidate(0, $links = $$value));
    	let url = "";
    	let mail = "";
    	let message = {};
    	let interval = null;

    	$$self.$capture_state = () => {
    		return {};
    	};

    	$$self.$inject_state = $$props => {
    		if ("url" in $$props) url = $$props.url;
    		if ("mail" in $$props) mail = $$props.mail;
    		if ("message" in $$props) message = $$props.message;
    		if ("interval" in $$props) interval = $$props.interval;
    		if ("$links" in $$props) links.set($links = $$props.$links);
    	};

    	return [$links];
    }

    class Edit extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$9, create_fragment$9, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Edit",
    			options,
    			id: create_fragment$9.name
    		});
    	}
    }

    /* src/Help.svelte generated by Svelte v3.16.7 */

    const file$a = "src/Help.svelte";

    function create_fragment$a(ctx) {
    	let a;

    	const block = {
    		c: function create() {
    			a = element("a");
    			a.textContent = "Fork me!";
    			attr_dev(a, "href", "https://github.com/ddidwyll/shorty");
    			attr_dev(a, "target", "_blank");
    			add_location(a, file$a, 0, 0, 0);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, a, anchor);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(a);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$a.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    class Help extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, null, create_fragment$a, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Help",
    			options,
    			id: create_fragment$a.name
    		});
    	}
    }

    /* src/App.svelte generated by Svelte v3.16.7 */
    const file$b = "src/App.svelte";

    // (9:2) <BtnGroup right>
    function create_default_slot_2$2(ctx) {
    	let t0;
    	let t1;
    	let current;

    	const button0 = new Button({
    			props: {
    				label: "Add",
    				disabled: !/*$router*/ ctx[0].action,
    				clean: true
    			},
    			$$inline: true
    		});

    	button0.$on("click", /*click_handler_1*/ ctx[2]);

    	const button1 = new Button({
    			props: {
    				label: "Search",
    				disabled: /*$router*/ ctx[0].action === "search",
    				clean: true
    			},
    			$$inline: true
    		});

    	button1.$on("click", /*click_handler_2*/ ctx[3]);

    	const button2 = new Button({
    			props: {
    				label: "Help",
    				disabled: /*$router*/ ctx[0].action === "help",
    				clean: true
    			},
    			$$inline: true
    		});

    	button2.$on("click", /*click_handler_3*/ ctx[4]);

    	const block = {
    		c: function create() {
    			create_component(button0.$$.fragment);
    			t0 = space();
    			create_component(button1.$$.fragment);
    			t1 = space();
    			create_component(button2.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(button0, target, anchor);
    			insert_dev(target, t0, anchor);
    			mount_component(button1, target, anchor);
    			insert_dev(target, t1, anchor);
    			mount_component(button2, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const button0_changes = {};
    			if (dirty & /*$router*/ 1) button0_changes.disabled = !/*$router*/ ctx[0].action;
    			button0.$set(button0_changes);
    			const button1_changes = {};
    			if (dirty & /*$router*/ 1) button1_changes.disabled = /*$router*/ ctx[0].action === "search";
    			button1.$set(button1_changes);
    			const button2_changes = {};
    			if (dirty & /*$router*/ 1) button2_changes.disabled = /*$router*/ ctx[0].action === "help";
    			button2.$set(button2_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(button0.$$.fragment, local);
    			transition_in(button1.$$.fragment, local);
    			transition_in(button2.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(button0.$$.fragment, local);
    			transition_out(button1.$$.fragment, local);
    			transition_out(button2.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(button0, detaching);
    			if (detaching) detach_dev(t0);
    			destroy_component(button1, detaching);
    			if (detaching) detach_dev(t1);
    			destroy_component(button2, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_2$2.name,
    		type: "slot",
    		source: "(9:2) <BtnGroup right>",
    		ctx
    	});

    	return block;
    }

    // (5:0) <Header>
    function create_default_slot_1$2(ctx) {
    	let h1;
    	let t0_value = (/*$router*/ ctx[0].action || "Shorty") + "";
    	let t0;
    	let t1;
    	let current;
    	let dispose;

    	const btngroup = new BtnGroup({
    			props: {
    				right: true,
    				$$slots: { default: [create_default_slot_2$2] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			h1 = element("h1");
    			t0 = text(t0_value);
    			t1 = space();
    			create_component(btngroup.$$.fragment);
    			attr_dev(h1, "class", "svelte-1b5h9hz");
    			add_location(h1, file$b, 5, 2, 137);
    			dispose = listen_dev(h1, "click", /*click_handler*/ ctx[1], false, false, false);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, h1, anchor);
    			append_dev(h1, t0);
    			insert_dev(target, t1, anchor);
    			mount_component(btngroup, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if ((!current || dirty & /*$router*/ 1) && t0_value !== (t0_value = (/*$router*/ ctx[0].action || "Shorty") + "")) set_data_dev(t0, t0_value);
    			const btngroup_changes = {};

    			if (dirty & /*$$scope, $router*/ 33) {
    				btngroup_changes.$$scope = { dirty, ctx };
    			}

    			btngroup.$set(btngroup_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(btngroup.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(btngroup.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(h1);
    			if (detaching) detach_dev(t1);
    			destroy_component(btngroup, detaching);
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_1$2.name,
    		type: "slot",
    		source: "(5:0) <Header>",
    		ctx
    	});

    	return block;
    }

    // (38:38) 
    function create_if_block_3(ctx) {
    	let current;
    	const help = new Help({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(help.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(help, target, anchor);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(help.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(help.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(help, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_3.name,
    		type: "if",
    		source: "(38:38) ",
    		ctx
    	});

    	return block;
    }

    // (36:40) 
    function create_if_block_2(ctx) {
    	let current;
    	const search = new Search({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(search.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(search, target, anchor);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(search.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(search.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(search, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2.name,
    		type: "if",
    		source: "(36:40) ",
    		ctx
    	});

    	return block;
    }

    // (34:38) 
    function create_if_block_1$1(ctx) {
    	let current;
    	const edit = new Edit({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(edit.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(edit, target, anchor);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(edit.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(edit.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(edit, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$1.name,
    		type: "if",
    		source: "(34:38) ",
    		ctx
    	});

    	return block;
    }

    // (32:2) {#if !$router.action}
    function create_if_block$2(ctx) {
    	let current;
    	const create = new Create({ $$inline: true });

    	const block = {
    		c: function create$1() {
    			create_component(create.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(create, target, anchor);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(create.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(create.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(create, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$2.name,
    		type: "if",
    		source: "(32:2) {#if !$router.action}",
    		ctx
    	});

    	return block;
    }

    // (31:0) <Main>
    function create_default_slot$5(ctx) {
    	let current_block_type_index;
    	let if_block;
    	let if_block_anchor;
    	let current;
    	const if_block_creators = [create_if_block$2, create_if_block_1$1, create_if_block_2, create_if_block_3];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (!/*$router*/ ctx[0].action) return 0;
    		if (/*$router*/ ctx[0].action === "edit") return 1;
    		if (/*$router*/ ctx[0].action === "search") return 2;
    		if (/*$router*/ ctx[0].action === "help") return 3;
    		return -1;
    	}

    	if (~(current_block_type_index = select_block_type(ctx))) {
    		if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    	}

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if (~current_block_type_index) {
    				if_blocks[current_block_type_index].m(target, anchor);
    			}

    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type(ctx);

    			if (current_block_type_index !== previous_block_index) {
    				if (if_block) {
    					group_outros();

    					transition_out(if_blocks[previous_block_index], 1, 1, () => {
    						if_blocks[previous_block_index] = null;
    					});

    					check_outros();
    				}

    				if (~current_block_type_index) {
    					if_block = if_blocks[current_block_type_index];

    					if (!if_block) {
    						if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    						if_block.c();
    					}

    					transition_in(if_block, 1);
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				} else {
    					if_block = null;
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (~current_block_type_index) {
    				if_blocks[current_block_type_index].d(detaching);
    			}

    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$5.name,
    		type: "slot",
    		source: "(31:0) <Main>",
    		ctx
    	});

    	return block;
    }

    function create_fragment$b(ctx) {
    	let title_value;
    	let t0;
    	let t1;
    	let current;

    	document.title = title_value = "shorty / " + (/*$router*/ ctx[0].action || "add") + (/*$router*/ ctx[0].param
    	? " / " + /*$router*/ ctx[0].param
    	: "");

    	const header = new Header({
    			props: {
    				$$slots: { default: [create_default_slot_1$2] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const main = new Main({
    			props: {
    				$$slots: { default: [create_default_slot$5] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			t0 = space();
    			create_component(header.$$.fragment);
    			t1 = space();
    			create_component(main.$$.fragment);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t0, anchor);
    			mount_component(header, target, anchor);
    			insert_dev(target, t1, anchor);
    			mount_component(main, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if ((!current || dirty & /*$router*/ 1) && title_value !== (title_value = "shorty / " + (/*$router*/ ctx[0].action || "add") + (/*$router*/ ctx[0].param
    			? " / " + /*$router*/ ctx[0].param
    			: ""))) {
    				document.title = title_value;
    			}

    			const header_changes = {};

    			if (dirty & /*$$scope, $router*/ 33) {
    				header_changes.$$scope = { dirty, ctx };
    			}

    			header.$set(header_changes);
    			const main_changes = {};

    			if (dirty & /*$$scope, $router*/ 33) {
    				main_changes.$$scope = { dirty, ctx };
    			}

    			main.$set(main_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(header.$$.fragment, local);
    			transition_in(main.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(header.$$.fragment, local);
    			transition_out(main.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t0);
    			destroy_component(header, detaching);
    			if (detaching) detach_dev(t1);
    			destroy_component(main, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$b.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$a($$self, $$props, $$invalidate) {
    	let $router;
    	validate_store(router, "router");
    	component_subscribe($$self, router, $$value => $$invalidate(0, $router = $$value));
    	const click_handler = () => router.go();
    	const click_handler_1 = () => router.go();
    	const click_handler_2 = () => router.go("search");
    	const click_handler_3 = () => router.go("help");

    	$$self.$capture_state = () => {
    		return {};
    	};

    	$$self.$inject_state = $$props => {
    		if ("$router" in $$props) router.set($router = $$props.$router);
    	};

    	return [$router, click_handler, click_handler_1, click_handler_2, click_handler_3];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$a, create_fragment$b, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment$b.name
    		});
    	}
    }

    const app = new App({
    	target: document.body
    });

    return app;

}());
//# sourceMappingURL=bundle.js.map
