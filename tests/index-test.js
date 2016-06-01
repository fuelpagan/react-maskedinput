/* eslint-env mocha */
import React from 'react'
import ReactDOM from 'react-dom'
import expect from 'expect'
import MaskedInput from 'src'

const setup = () => {
  const element = document.createElement('div')
  document.body.appendChild(element)
  return element;
};

const cleanup = (element) => {
  ReactDOM.unmountComponentAtNode(element)
  document.body.removeChild(element)
}

describe('MaskedInput', () => {
  it('should render (smokescreen test)', () => {
    expect.spyOn(console, 'error')
    expect(<MaskedInput />).toExist()
    expect(console.error.calls[0].arguments[0]).toBe(
      'Warning: Failed propType: Required prop `mask` was not specified in ' +
      '`MaskedInput`.'
    )
  })

  it('should handle a masking workflow', () => {
    const el = setup()
    let ref = null
    ReactDOM.render(
      <MaskedInput
        ref={(r) => {
          if (r) ref = r
        }}
        mask="11/11"
      />,
      el
    )
    const input = ReactDOM.findDOMNode(ref)

    // initial state
    expect(input.value).toBe('')
    expect(input.placeholder).toBe('__/__')
    expect(input.size).toBe(5)

    cleanup(el)
  })

  it('should handle updating mask masking', () => {
    const el = setup()
    let ref = null
    let defaultMask = '1111 1111 1111 1111'
    let amexMask = '1111 111111 11111'
    let mask = defaultMask

    function render() {
      ReactDOM.render(
        <MaskedInput
          ref={(r) => {
            if (r) ref = r
          }}
          mask={mask}
        />,
        el
      )
    }

    render();
    let input = ReactDOM.findDOMNode(ref)

    // initial state
    expect(input.value).toBe('')
    expect(input.placeholder).toBe('____ ____ ____ ____')
    expect(input.size).toBe(19)
    expect(input.selectionStart).toBe(0)

    mask = amexMask
    render();
    input = ReactDOM.findDOMNode(ref)

    // initial state
    expect(input.value).toBe('')
    expect(input.placeholder).toBe('____ ______ _____')
    expect(input.size).toBe(17)
    expect(input.selectionStart).toBe(0)

    cleanup(el)
  })

  describe('testing full value change', () => {
    const el = setup()
    let ref = null
    let mask = '(111) 111-1111'
    let value = ''

    function render() {
      ReactDOM.render(
        <MaskedInput
          ref={(r) => {
            if (r) ref = r
          }}
          mask={mask}
          value={value}
        />,
        el
      )
    }

    // keeping the same element to simulate a user changing between different autofill options and selecting different ones.
    render();
    let input = ReactDOM.findDOMNode(ref)

    // initial state
    it('should have the expected initial state', () => {
      expect(input.value).toBe('')
      expect(input.placeholder).toBe('(___) ___-____')
      expect(input.size).toBe(14)
      expect(input.selectionStart).toBe(0)
    })

    it('should handle updating value with formatting', () => {
      value = '(432) 543-9876'

      render();
      input = ReactDOM.findDOMNode(ref)

      // new state
      expect(input.value).toBe('(432) 543-9876')
      expect(input.size).toBe(14)
      expect(input.selectionStart).toBe(14)
    })

    it('should handle updating value without formatting', () => {

      value = '3454521234'

      render();
      input = ReactDOM.findDOMNode(ref)

      // new state
      expect(input.value).toBe('(345) 452-1234')
      expect(input.size).toBe(14)
      expect(input.selectionStart).toBe(14)

    })

    it('should handle updating value with slightly different formatting', () => {

      // please note: if 789-123-4321, the input will fail because it is taking the - as an input
      value = '789 123-4321'

      render();
      input = ReactDOM.findDOMNode(ref)

      // new state
      expect(input.value).toBe('(789) 123-4321')
      expect(input.size).toBe(14)
      expect(input.selectionStart).toBe(14)

    })

    cleanup(el)
  })

})
