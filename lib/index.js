'use strict';

var React = require('react')
var $__0=   require('react-dom/lib/ReactInputSelection'),getSelection=$__0.getSelection,setSelection=$__0.setSelection

var InputMask = require('inputmask-core')

var KEYCODE_Z = 90
var KEYCODE_Y = 89

function isUndo(e) {
  return (e.ctrlKey || e.metaKey) && e.keyCode === (e.shiftKey ? KEYCODE_Y : KEYCODE_Z)
}

function isRedo(e) {
  return (e.ctrlKey || e.metaKey) && e.keyCode === (e.shiftKey ? KEYCODE_Z : KEYCODE_Y)
}

var MaskedInput = React.createClass({displayName: "MaskedInput",
  propTypes: {
    mask: React.PropTypes.string.isRequired,

    formatCharacters: React.PropTypes.object,
    placeholderChar: React.PropTypes.string
  },

  getDefaultProps:function() {
    return {
      value: ''
    }
  },

  componentWillMount:function() {
    var options = {
      pattern: this.props.mask,
      value: this.props.value,
      formatCharacters: this.props.formatCharacters
    }
    if (this.props.placeholderChar) {
      options.placeholderChar = this.props.placeholderChar
    }
    this.mask = new InputMask(options)
  },

  componentWillReceiveProps:function(nextProps) {
    if (this.props.mask !== nextProps.mask) {
      this.mask.setPattern(nextProps.mask, {value: this.mask.getRawValue()})
    }
    this.mask.setValue(nextProps.value);
  },

  _updateMaskSelection:function() {
    this.mask.selection = getSelection(this.input)
  },

  _updateInputSelection:function() {
    setSelection(this.input, this.mask.selection)
  },

  _onChange:function(e) {
    // console.log('onChange', JSON.stringify(getSelection(this.input)), e.target.value)

    var maskValue = this.mask.getValue()
    if (e.target.value != maskValue) {
      // Cut or delete operations will have shortened the value
      if (e.target.value.length < maskValue.length) {
        var sizeDiff = maskValue.length - e.target.value.length
        this._updateMaskSelection()
        this.mask.selection.end = this.mask.selection.start + sizeDiff
        this.mask.backspace()
      }
      this.mask.setValue(e.target.value);
      var value = this._getDisplayValue()
      e.target.value = value
      if (value) {
        this._updateInputSelection()
      }
    }
    if (this.props.onChange) {
      this.props.onChange(e)
    }
  },

  _onKeyDown:function(e) {
    // console.log('onKeyDown', JSON.stringify(getSelection(this.input)), e.key, e.target.value)

    if (isUndo(e)) {
      e.preventDefault()
      if (this.mask.undo()) {
        e.target.value = this._getDisplayValue()
        this._updateInputSelection()
        this.props.onChange(e)
      }
      return
    }
    else if (isRedo(e)) {
      e.preventDefault()
      if (this.mask.redo()) {
        e.target.value = this._getDisplayValue()
        this._updateInputSelection()
        this.props.onChange(e)
      }
      return
    }

    if (e.key == 'Backspace') {
      e.preventDefault()
      this._updateMaskSelection()
      if (this.mask.backspace()) {
        var value = this._getDisplayValue()
        e.target.value = value
        if (value) {
          this._updateInputSelection()
        }
        this.props.onChange(e)
      }
    }
  },

  _onKeyPress:function(e) {
    // console.log('onKeyPress', JSON.stringify(getSelection(this.input)), e.key, e.target.value)

    // Ignore modified key presses
    if (e.metaKey || e.altKey || e.ctrlKey) { return }

    e.preventDefault()
    this._updateMaskSelection()
    if (this.mask.input(e.key)) {
      e.target.value = this.mask.getValue()
      this._updateInputSelection()
      this.props.onChange(e)
    }
  },

  _onPaste:function(e) {
    // console.log('onPaste', JSON.stringify(getSelection(this.input)), e.clipboardData.getData('Text'), e.target.value)

    e.preventDefault()
    this._updateMaskSelection()
    // getData value needed for IE also works in FF & Chrome
    if (this.mask.paste(e.clipboardData.getData('Text'))) {
      e.target.value = this.mask.getValue()
      // Timeout needed for IE
      setTimeout(this._updateInputSelection, 0)
      this.props.onChange(e)
    }
    else {
      this.mask.setValue(e.clipboardData.getData('Text'));
      var value = this._getDisplayValue()
      e.target.value = value
      if (value) {
        this._updateInputSelection()
      }
    }
  },

  _getDisplayValue:function() {
    var value = this.mask.getValue()
    return value === this.mask.emptyValue ? '' : value
  },

  render:function() {
    var $__0=      this.props,mask=$__0.mask,formatCharacters=$__0.formatCharacters,size=$__0.size,placeholder=$__0.placeholder,props=(function(source, exclusion) {var rest = {};var hasOwn = Object.prototype.hasOwnProperty;if (source == null) {throw new TypeError();}for (var key in source) {if (hasOwn.call(source, key) && !hasOwn.call(exclusion, key)) {rest[key] = source[key];}}return rest;})($__0,{mask:1,formatCharacters:1,size:1,placeholder:1})
    var patternLength = this.mask.pattern.length
    return React.createElement("input", React.__spread({},  props, 
      {ref: function(r)  {return this.input = r;}.bind(this), 
      maxLength: patternLength, 
      onChange: this._onChange, 
      onKeyDown: this._onKeyDown, 
      onKeyPress: this._onKeyPress, 
      onPaste: this._onPaste, 
      placeholder: placeholder || this.mask.emptyValue, 
      size: size || patternLength, 
      value: this._getDisplayValue()})
    )
  }
})

module.exports = MaskedInput
