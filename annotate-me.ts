/**
 * Annotate all of this code with types. Annotate the following:
 * - Local variables.
 * - Function parameters.
 * - Return types for functions.
 * - Exports.
 *
 * This program asks for a number between 1 and 10 from the user. If the number
 * is typed in incorrectly or doesn't match the range specified, the program
 * will print an error and ask again. Otherwise the program terminates with a
 * success message.
 *
 * Usage:
 * npx ts-node annotate-me.ts
 */

// Types from here come from the @types/node package in this project's
// devDependencies in package.json.
import fs from 'fs/promises'

// These types are not correctly constructed. It is up to you to figure out what
// to put in.
type UnsanitizedNumber = {
  kind: 'unsanitized-number',
  value: number,
}
type SanitizedNumber = {
  kind: 'sanitized-number',
  value: number,
}
type InvalidNumber = {
  kind: 'invalid-number',
}

// This type is valid though. A freebie!
type AppNumber =
  | InvalidNumber
  | SanitizedNumber
  | UnsanitizedNumber

/**
 * Takes a string and converts it to a number. This is the first stage of
 * providing our valid data.
 */
const unsanitizedNumber = (input: string): UnsanitizedNumber | null => {
  const num = parseInt(input)
  if(isNaN(num)) {
    return null
  } else {
    return {
      kind: 'unsanitized-number',
      value: parseInt(input),
    }
  }
}

/**
 * The number we got from our first stage is a number of any value. As the
 * second stage, this function ensures the number is within the expected range.
 * More practical applications of this could be making sure an email input by a
 * user is indeed formatted as an email.
 */
const sanitizedNumber = (input: UnsanitizedNumber | null): SanitizedNumber | null => {
  if(input == null) {
    // If null, just pass the error along.
    return null
  } else {
    if(input.value > 0 && input.value <= 10) {
      return {
        kind: 'sanitized-number',
        value: input.value,
      }
    } else {
      return null
    }
  }
}

// Non-arrow function.
// Note this function does not return anything. How to annotate it?
// We also don't particularly care what is passed in. How do we annotate a
// parameter whose shape we care nothing about?
function showError(x: any): void {
  console.error(`${x} is not what I asked for.`)
}

// Hack to make async functions work at the root of a module.
(async () => {
  console.log('Give me a number between 1 and 10:')
  // Our final number doesn't exist yet. Must be set to an invalid state so
  // nothing can fall through.
  let finalNumber: AppNumber = {
    kind: 'invalid-number',
  }
  // This is a "do-while" loop. First the body (everything between the curly
  // braces) is executed. Then the condition is evaluated in the "while"
  // condition that comes after the curly braces. If the expression is true,
  // execution loops back to the top of the "do" block.
  //
  // do-while loops are good for "do something once, then check to see if I need
  // to keep doing it".
  do {
    const input: string = await fs.readFile('/dev/stdin', 'utf8')
    // Normally we wouldn't call these numStep1 and numStep2, but this is to
    // help guide through the flow of the program.
    const numStep1: UnsanitizedNumber | null = unsanitizedNumber(input)
    const numStep2: SanitizedNumber | null = sanitizedNumber(numStep1)
    if(numStep2 != null) {
      finalNumber = numStep2
    } else {
      showError(input)
    }
  } while(finalNumber.kind != 'sanitized-number')

  console.log(`You did what I wanted and gave me ${finalNumber.value}!`)

  // Immediately call the function we just declared to complete the async hack.
})()

////////////////////////////////////////////////////////////////////////////////
// The section below does not get executed. This stands as a means of asserting
// the negative end of the typings we're doing. Do not remove the @ts comments.
////////////////////////////////////////////////////////////////////////////////

const invalidTestData: InvalidNumber = {
  kind: 'invalid-number',
}

const unsanitizedTestData: UnsanitizedNumber = {
  kind: 'unsanitized-number',
  value: 0,
}

const sanitizedTestData: SanitizedNumber = {
  kind: 'sanitized-number',
  value: 0,
}

// The declare keyword lets us declare a type from some global/external source.
// It's our way to tell TypeScript to pretend this function exists, and this is
// its signature.
declare function testUnsanitized(x: UnsanitizedNumber): void
declare function testSanitized(x: SanitizedNumber): void
declare function testInvalid(x: InvalidNumber): void

// Positive case.
testUnsanitized(unsanitizedTestData)
// This annotated comment below will prevent a type error from showing up when
// we run `tsc`. It will inversely also create an error if the below expression
// would not normally produce a type error.
//
// This kind of flagging is useful for "testing" our types, which you will see
// in the DefinitelyTyped open source project
// (https://github.com/DefinitelyTyped/DefinitelyTyped), a repository of 3rd
// party type definitions - a way of shoeing in types for those who have not
// seen the light yet. They can also be useful for ensuring your type
// restrictions work as intended.
//
// See
// https://www.typescriptlang.org/docs/handbook/release-notes/typescript-3-9.html#-ts-expect-error-comments
// for more details on feature, as well as it's cousin, ts-ignore (which we will
// not prefix with @ to prevent it from triggering).
//
// @ts-expect-error
testUnsanitized(sanitizedTestData)
// @ts-expect-error
testUnsanitized(invalidTestData)
// @ts-expect-error
testUnsanitized(sanitizedTestData)

testSanitized(sanitizedTestData)
// @ts-expect-error
testSanitized(invalidTestData)
// @ts-expect-error
testSanitized(unsanitizedTestData)

testInvalid(invalidTestData)
// @ts-expect-error
testInvalid(sanitizedTestData)
// @ts-expect-error
testInvalid(unsanitizedTestData)

declare function getNumber(): AppNumber

const number: AppNumber = getNumber()
// We cannot use the value property all the time - the case of InvalidNumber has
// no value (any value would be meaningless, so we just leave it off).
// @ts-expect-error
number.value

const getValue = (num: AppNumber): number => {
  switch(num.kind) {
    case 'invalid-number':
      // @ts-expect-error
      return num.value
    case 'sanitized-number':
      // This works because we have narrowed the type.
      return num.value
    case 'unsanitized-number':
      return num.value
  }
}

getValue(number)
