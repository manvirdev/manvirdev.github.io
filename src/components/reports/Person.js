// Person.js

class Person {
    constructor(firstName, lastName) {
        this.firstName = firstName;
        this.lastName = lastName;
    }

    getFullName() {
        return `${this.firstName} ${this.lastName}`;
    }

    isSamePerson(otherPerson) {
        return (
            this.firstName.toLowerCase() === otherPerson.firstName.toLowerCase() &&
            this.lastName.toLowerCase() === otherPerson.lastName.toLowerCase()
        );
    }
}

export default Person;
