import React, {Component} from 'react';
import classes from './QuizCreator.module.css';
import Button from '../../components/UI/Buttton/Button'
import Input from '../../components/UI/input/input'
import Select from '../../components/UI/Select/Select'
import {createControl, validate, validateForm} from '../../form/formFramework'
import Auxiliary from '../../hoc/Auxiliary/Auxiliary'
import axios from 'axios';

function createOptionControl(number) {
  return createControl({
    label: `Вариант ${number}`,
    errorMessage: 'Не тупи, бро! Значение не может быть пустым',
    id: number,
  }, {
    required: true,
    isFormValid: false,
  })
}

function createFormControls() {
  return {
    question: createControl({
      label: 'Введите вопрос:',
      errorMessage: 'Не тупи, бро!',
    }, {
      required: true,
    }),
    option1: createOptionControl(1),
    option2: createOptionControl(2),
    option3: createOptionControl(3),
    option4: createOptionControl(4),
  }
}

// _________________________________________________________________

export default class QuizCreator extends Component {

  state = {
    quiz: [],
    rightAnswerId: 1,
    formControls: createFormControls(),
  }

  submitHandler = (evt) => {
    evt.preventDefault();
  }

  selectChangeHandler = (evt) => {
    const rightAnswerId = +evt.target.value;
    this.setState({
      rightAnswerId,
    })
  }

  changeHandler(value, controlName) {
    const formControls = this.state.formControls;
    const control = {...formControls[controlName]};

    control.touched = true;
    control.value = value;
    control.valid = validate(control.value, control.validation);

    formControls[controlName] = control;

    this.setState({
      formControls,
      isFormValid: validateForm(formControls),
    })
  }
  addQuestionHandler = (event) => {
    event.preventDefault();
    const quiz = this.state.quiz.concat();
    const index = quiz.length + 1;

    const {question, option1, option2, option3, option4} = this.state.formControls

    const questionItem = {
      question: question.value,
      id: index,
      rightAnswerId: this.state.rightAnswerId,
      answers: [
        {text: option1.value, id: option1.id},
        {text: option2.value, id: option2.id},
        {text: option3.value, id: option3.id},
        {text: option4.value, id: option4.id},
      ]
    }

    quiz.push(questionItem);
    this.setState({
      quiz,
      rightAnswerId: 1,
      formControls: createFormControls(),
    })
  }

  createQuizHandler = async (event) => {
    event.preventDefault();

    try {
      await axios.post('https://react-quiz-b928e.firebaseio.com/quizes.json', this.state.quiz);
      this.setState({
        quiz: [],
        rightAnswerId: 1,
        formControls: createFormControls(),
      })
    } catch (e) {
      console.log(e);
    }

  }

  renderControls(state) {
    return Object.keys(this.state.formControls).map((controlName, index) => {
      const control = this.state.formControls[controlName]

      return (
        <Auxiliary key = {controlName + index}>
          <Input
            label = {control.label}
            value = {control.value}
            valid = {control.valid}
            shouldValidate = {!!control.validation}
            touched = {control.touched}
            errorMessage = {control.errorMessage}
            onChange = {(event) => this.changeHandler(event.target.value, controlName)}
          />
          {index === 0 ? <hr/> : null}
        </Auxiliary>
      )
    })
  }


  render() {
    const select = <Select
      label = 'Выберите правильный ответ'
      value = {this.state.rightAnswerId}
      onChange = {this.selectChangeHandler}
      options = {[
        {text: `1`, value: 1},
        {text: `2`, value: 2},
        {text: `3`, value: 3},
        {text: `4`, value: 4},
      ]}
      />

    return (
      <div className = {classes.QuizCreator}>
        <div>
          <h1>Создание теста</h1>
          <form onSubmit = {this.submitHandler}>
            {this.renderControls(this.state)}

            {select}

            <Button
              type = "primary"
              onClick = {this.addQuestionHandler}
              disabled = {!this.state.isFormValid}
            >
              Добавить вопрос
            </Button>

            <Button
              type = "success"
              onClick = {this.createQuizHandler}
              disabled = {this.state.quiz.length === 0}
            >
              Создать тест
            </Button>
          </form>
        </div>
      </div>
    );
  }
}
