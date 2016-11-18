var StyleCache = function (prefix) {
	this.prefix = prefix + 'C-'
	this.style = document.createElement('style')
	document.head.appendChild(this.style)
	this.total = 0
	this.stats = {}
	this.classes = {}
	this.classes_total = 0
}

StyleCache.prototype.constructor = StyleCache

StyleCache.prototype.add = function(rule) {
	this.stats[rule] = (this.stats[rule] || 0) + 1
	++this.total
}

StyleCache.prototype.register = function(rules) {
	var key = rules.join('+')
	var classes = this.classes
	var cls = classes[key]
	if (cls !== undefined)
		return cls

	var cls = classes[key] = this.prefix + this.classes_total++
	this.style.appendChild(document.createTextNode(cls + '{' + rules.join(';') + '}'))
	return cls
}

StyleCache.prototype.classify = function(rules) {
	var total = this.total
	if (total < 100) //fixme: initial population threshold
		return ''

	rules.sort() //mind vendor prefixes!
	var n = rules.length
	var classes = []
	var classified = []
	var hot = []
	var self = this
	rules.forEach(function(rule, idx) {
		var hits = self.stats[rule]
		var usage = hits
		if (usage > 100) { //fixme: usage threshold
			classified.push(rule)
			hot.push(idx)
		}
	})
	if (hot.length < 2)
		return ''
	hot.forEach(function(offset, idx) {
		rules.splice(offset - idx, 1)
	})
	return self.register(classified)
}

var registerGenericListener = function(target) {
	var copyArguments = _globals.core.copyArguments
	var prefix = '_domEventHandler_'
	target.onListener('',
		function(name) {
			//log('registering generic event', name)
			var pname = prefix + name
			var callback = target[pname] = function() {
				var args = copyArguments(arguments, 0, name)
				target.emit.apply(target, args)
			}
			target.dom.addEventListener(name, callback)
		},
		function(name) {
			//log('removing generic event', name)
			var pname = prefix + name
			target.dom.removeEventListener(name, target[pname])
		}
	)
}

/**
 * @constructor
 */

exports.Element = function(context, dom) {
	if (!context._styleCache)
		context._styleCache = new StyleCache(context._prefix)

	_globals.core.EventEmitter.apply(this)
	this._context = context
	this.dom = dom
	this._fragment = []
	this._styles = {}

	registerGenericListener(this)
}

exports.Element.prototype = Object.create(_globals.core.EventEmitter.prototype)
exports.Element.prototype.constructor = exports.Element

exports.Element.prototype.addClass = function(cls) {
	this.dom.classList.add(cls)
}

exports.Element.prototype.setHtml = function(html) {
	var dom = this.dom
	this._fragment.forEach(function(node) { dom.removeChild(node) })
	this._fragment = []

	if (html === '')
		return

	var fragment = document.createDocumentFragment()
	var temp = document.createElement('div')

	temp.innerHTML = html
	while (temp.firstChild) {
		this._fragment.push(temp.firstChild)
		fragment.appendChild(temp.firstChild)
	}
	dom.appendChild(fragment)
	return dom.children
}

exports.Element.prototype.width = function() {
	return this.dom.clientWidth
}

exports.Element.prototype.height = function() {
	return this.dom.clientHeight
}

exports.Element.prototype.fullWidth = function() {
	return this.dom.scrollWidth
}

exports.Element.prototype.fullHeight = function() {
	return this.dom.scrollHeight
}

exports.Element.prototype.style = function(name, style) {
	if (style !== undefined) {
		if (style !== '') //fixme: replace it with explicit 'undefined' syntax
			this._styles[name] = style
		else
			delete this._styles[name]
		this.updateStyle()
	} else if (name instanceof Object) { //style({ }) assignment
		for(var k in name) {
			var value = name[k]
			if (value !== '') //fixme: replace it with explicit 'undefined' syntax
				this._styles[k] = value
			else
				delete this._styles[k]
		}
		this.updateStyle()
	}
	else
		return this._styles[name]
}

exports.Element.prototype.setAttribute = function(name, value) {
	this.dom.setAttribute(name, value)
}

exports.Element.prototype.updateStyle = function() {
	var element = this.dom
	if (!element)
		return

	/** @const */
	var cssUnits = {
		'left': 'px',
		'top': 'px',
		'width': 'px',
		'height': 'px',

		'border-radius': 'px',
		'border-width': 'px',

		'margin-left': 'px',
		'margin-top': 'px',
		'margin-right': 'px',
		'margin-bottom': 'px',

		'padding-left': 'px',
		'padding-top': 'px',
		'padding-right': 'px',
		'padding-bottom': 'px'
	}

	var cache = this._context._styleCache
	var rules = []
	for(var name in this._styles) {
		var value = this._styles[name]

		var prefixedName = this._context.getPrefixedName(name)
		var ruleName = prefixedName !== false? prefixedName: name
		if (Array.isArray(value))
			value = value.join(',')

		var unit = (typeof value === 'number')? cssUnits[name] || '': ''
		value += unit

		//var prefixedValue = window.Modernizr.prefixedCSSValue(name, value)
		//var prefixedValue = value
		var rule = ruleName + ':' + value //+ (prefixedValue !== false? prefixedValue: value)
		cache.add(rule)

		rules.push(rule)
	}
	var cls = cache.classify(rules)
	if (cls.length > 0 && this._class !== cls) {
		var classList = this.dom.classList
		if (this._class !== undefined)
			classList.remove(this._class)
		this._class = cls
		classList.add(cls)
	}
	this.dom.setAttribute('style', rules.join(';'))
}

exports.Element.prototype.append = function(el) {
	this.dom.appendChild((el instanceof exports.Element)? el.dom: el)
}

exports.Element.prototype.discard = function() {
	_globals.core.EventEmitter.prototype.discard.apply(this)
	this.remove()
}

exports.Element.prototype.remove = function() {
	var dom = this.dom
	dom.parentNode.removeChild(dom)
}

exports.Window = function(context, dom) {
	_globals.core.EventEmitter.apply(this)
	this._context = context
	this.dom = dom

	registerGenericListener(this)
}

exports.Window.prototype = Object.create(_globals.core.EventEmitter.prototype)
exports.Window.prototype.constructor = exports.Window

exports.Window.prototype.width = function() {
	return this.dom.innerWidth
}

exports.Window.prototype.height = function() {
	return this.dom.innerHeight
}

exports.Window.prototype.scrollY = function() {
	return this.dom.scrollY
}

exports.getElement = function(tag) {
	var tags = document.getElementsByTagName(tag)
	if (tags.length != 1)
		throw new Error('no tag ' + tag + '/multiple tags')
	return new exports.Element(this, tags[0])
}
