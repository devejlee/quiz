import React, { useEffect, useState } from 'react';
import type { NextPage } from 'next'
import Head from 'next/head'
import styles from '../styles/index.module.scss'

const Quiz: NextPage = () => {
  const [startQuiz, setStartQuiz] = useState(false)
  const [data, setData] = useState([] as any[]);
  const [questionCount, setQuestionCount] = useState(0)
  const [answerCount, setAnswerCount] = useState(0)
  const [answered, setAnswered] = useState(false)
  const [startTime, setStartTime] = useState({})

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async (): Promise<void> => {
    const response = await fetch("https://opentdb.com/api.php?amount=10&category=9&difficulty=easy&type=multiple");
    const data = await response.json();
    const newResults = data.results.map((result: any) => {
      result = JSON.parse(JSON.stringify(result))
      result.incorrect_answers.push(result.correct_answer)
      result.incorrect_answers.sort()
      return result
    })
    setData(newResults)
    const start = new Date();
    setStartTime(start)
  };

  const openQuiz = (): void => {
    setStartQuiz(true)
  }

  const restartQuiz = (): void => {
    fetchData();
    setQuestionCount(0)
    setAnswerCount(0)
  }

  const handleClick = (e: any, answer: string): void => {
    setAnswered(true)
    if (e.textContent === answer && !answered) {
      e.classList.add(styles.correct)
      setAnswerCount(answerCount => answerCount + 1)
    } else if (e.textContent !== answer && !answered) {
      e.classList.add(styles.incorrect)
    }
  }

  const showNextQuestion = (): void => {
    setQuestionCount(questionCount => questionCount + 1)
    setAnswered(false)
  }

  const timePassed = (endTime: Date): string => {
    let timeDiff = +endTime - +startTime
    timeDiff /= 1000
    const minutes = timeDiff / 60
    if (minutes >= 1) {
      const decimal = minutes - Math.floor(minutes)
      const remainingSeconds = decimal * 30
      return `${Math.round(minutes)} minutes and ${Math.round(remainingSeconds)} seconds`
    } else {
      return `${Math.round(timeDiff)} seconds`
    }
  }

  return (
    <div>
      <Head>
        <title>Quiz</title>
        <meta name="description" content="Generated by create next app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        {!startQuiz ? (
          <>
            <h1 className={styles.title}>
              퀴즈에 환영합니다!
            </h1>
            <button className={styles.quizButton} onClick={openQuiz}>퀴즈 풀기</button>
          </>
        ) : (
          <div className={styles.card}>
            {questionCount !== data.length && (
              <p className={styles.questionCount}>Question: {questionCount + 1} / {data.length}</p>
            )}
            {data.slice(questionCount, questionCount + 1).map((d) => {
              const answer = d.correct_answer
              return (
                <div key={d.correct_answer}>
                  <p dangerouslySetInnerHTML={{ __html: d.question }} className={styles.question} />
                  {d.incorrect_answers.map((d: string) => (
                    <p key={d} dangerouslySetInnerHTML={{ __html: d }} className={styles.choice} onClick={(e) => handleClick(e.target, answer)} />
                  ))}
                </div>
              )
            })}
            {answered && (
              <button className={styles.nextButton} onClick={showNextQuestion}>{questionCount === data.length - 1 ? '결과 보기' : '다음 문항'}</button>
            )}
            {questionCount === data.length && (
              <>
                <p>{timePassed(new Date())}</p>
                <p>correct answers: {answerCount}</p>
                <p>wrong answers: {data.length - answerCount}</p>
                <button onClick={restartQuiz}>Try again</button>
              </>
            )}
          </div>
        )}
      </main>
    </div>
  )
}

export default Quiz
