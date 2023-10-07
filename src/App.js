import { useReducer } from "react";
import DigitButton from "./DigitButton";
import OperationButton from "./OperationButton";
import "./styles.css"

export const ACTIONS = {
  ADD_DIGIT: 'add-digit',
  CHOOSE_OPERATION: 'choose-operation',
  CLEAR: 'clear',
  DELETE_DIGIT: 'delete-digit',
  EVALUATE: 'evaluate'
}
function reducer(state, { type, payload }) {
  switch (type) {
    case ACTIONS.ADD_DIGIT:
      /*checking if we just finished a calculation, if so clear the number then add new operand*/
      if (state.overwrite) {
        return {
          ...state,
          currentOperand: payload.digit,
          overwrite: false
        }
      }
      /*edge cases for adding zeros and decimals*/
      if (payload.digit === "0" && state.currentOperand === "0") { return state }
      if (payload.digit === "." && state.currentOperand == null) { return state }
      if (payload.digit === "." && state.currentOperand.includes(".")) { return state }
      /*normal adding operation (adds digit)*/
      return {
        ...state,
        currentOperand: `${state.currentOperand || ""}${payload.digit}`,
      }
    case ACTIONS.CHOOSE_OPERATION:
      /*making sure if state is empty operation won't do anything*/
      if (state.currentOperand == null && state.previousOperand == null) { return state }

      /*if you want to switch operators because you hit the wrong one after already tying first number*/
      if (state.currentOperand == null) {
        return {
          ...state,
          operation: payload.operation,
        }
      }

      /*if prev operand null and current not null then a operation is pressed it makes curr to previous and the operation is saved*/
      if (state.previousOperand == null) {
        return {
          ...state,
          operation: payload.operation,
          previousOperand: state.currentOperand,
          currentOperand: null,
        }
      }

      /*default action (handles if multiple operations are pressed (evaluates current and previous with correct operation then sets answer to previous operand and sets current to null to be able to recieve new operand. This is also so we don't have to use a stack*/
      return {
        ...state,
        previousOperand: evaluate(state),
        operation: payload.operation,
        currentOperand: null

      }
    /*if ac pressed resets state to be empty*/
    case ACTIONS.CLEAR:
      return {}

    /*deleting a digit*/
    case ACTIONS.DELETE_DIGIT:
      /*if calculation was just done we can delete who number*/
      if (state.overwrite) {
        return {
          ...state,
          overwrite: false,
          currentOperand: null
        }
      }
      /*if nothing do nothing*/
      if (state.currentOperand == null) { return state }
      /*if number only has one digit just delete the whole thing (curr op to null)*/
      if (state.currentOperand.length === 1) {
        return {
          ...state,
          currentOperand: null
        }
      }
      /*if there are multiple digits we slice off the last one*/
      return {
        ...state,
        currentOperand: state.currentOperand.slice(0, -1)
      }


    /*if equal button pressed evaluate*/
    case ACTIONS.EVALUATE:
      /*if any info is missing curr or prev operand or operation do nothing (return current state)*/
      if (state.operation == null ||
        state.currentOperand == null ||
        state.previousOperand == null
      ) {
        return state
      }
      /*else, do the evaluation and set overwrite to true (so we know to clear if a new digit is pressed after evaluation)*/
      return {
        ...state,
        overwrite: true,
        previousOperand: null,
        operation: null,
        currentOperand: evaluate(state)
      }


  }
}

function evaluate({ currentOperand, previousOperand, operation }) {
  /*convert operand strings to nums*/
  const prev = parseFloat(previousOperand)
  const current = parseFloat(currentOperand)
  /*if any operands missing we return empty str*/
  if (isNaN(prev) || isNaN(current)) { return "" }
  /*default case computation returns empty str*/
  let computation = ""
  /*case for each operator (+,-,÷,*)*/
  switch (operation) {
    case "+":
      computation = prev + current
      break
    case "-":
      computation = prev - current
      break
    case "*":
      computation = prev * current
      break
    case "÷":
      computation = prev / current
      break

  }
  return computation.toString()
}
/*formatting int part of output so no fraction */
const INTEGER_FORMATTER = new Intl.NumberFormat("en-us", {
  maximumFractionDigits: 0,

})

function formatOperand(operand) {
  /*if we have an operand we split it over the decimal, ex: 3.0 becomes int = 12 dec = 0, if no decimal like 3 the dec = null*/
  if (operand == null) { return }
  const [integer, decimal] = operand.split('.')
  /*if no decimal we can just format the integer portion*/
  if (decimal == null) {
    return INTEGER_FORMATTER.format(integer)
  }
  /*if we have decimal format int then add decimal (unformatted because the number formatter would remove trailing zeros and we want to be able to type 9.000003 or similar )*/
  return `${INTEGER_FORMATTER.format(integer)}.${decimal}`

}


function App() {
  const [{ currentOperand, previousOperand, operation }, dispatch] = useReducer(reducer, {})



  return (
    <div className="calculator-grid">
      <div className="output">
        <div className="previous-operand">{formatOperand(previousOperand)} {operation}</div>
        <div className="current-operand">{formatOperand(currentOperand)}</div>
      </div>
      <button className="span-two" onClick={() => dispatch({ type: ACTIONS.CLEAR })}>AC</button>
      <button onClick={() => dispatch({ type: ACTIONS.DELETE_DIGIT })}>DEL</button>
      <OperationButton operation="÷" dispatch={dispatch} />
      <DigitButton digit="1" dispatch={dispatch} />
      <DigitButton digit="2" dispatch={dispatch} />
      <DigitButton digit="3" dispatch={dispatch} />
      <OperationButton operation="*" dispatch={dispatch} />
      <DigitButton digit="4" dispatch={dispatch} />
      <DigitButton digit="5" dispatch={dispatch} />
      <DigitButton digit="6" dispatch={dispatch} />
      <OperationButton operation="+" dispatch={dispatch} />
      <DigitButton digit="7" dispatch={dispatch} />
      <DigitButton digit="8" dispatch={dispatch} />
      <DigitButton digit="9" dispatch={dispatch} />
      <OperationButton operation="-" dispatch={dispatch} />
      <DigitButton digit="." dispatch={dispatch} />
      <DigitButton digit="0" dispatch={dispatch} />
      <button className="span-two" onClick={() => dispatch({ type: ACTIONS.EVALUATE })}>=</button>

    </div>
  )
}

export default App;
