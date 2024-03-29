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
  const [loading, setLoading] = useState(false)
  const [notes, setNotes] = useState([] as any[])
  const [showNotes, setShowNotes] = useState(false)

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async (): Promise<void> => {
    try {
      setLoading(true)
      const response = await fetch("https://opentdb.com/api.php?amount=10&category=9&difficulty=easy&type=multiple");
      const data = await response.json();
      const newResults = data.results.map((result: any) => {
        result = JSON.parse(JSON.stringify(result))
        result.incorrect_answers.push(result.correct_answer)
        result.incorrect_answers.sort()
        return result
      })
      setData(newResults)
      setStartTime(new Date())
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const openQuiz = (): void => {
    setStartQuiz(true)
  }

  const restartQuiz = (): void => {
    fetchData();
    setQuestionCount(0)
    setAnswerCount(0)
    setNotes([])
    setShowNotes(false)
  }

  const openNotes = (): void => {
    setShowNotes(true)
  }

  const parseEntities = (text: string) => new DOMParser().parseFromString(text, 'text/html').body.innerText;

  const handleClick = (e: any, question: string, answer: string): void => {
    setAnswered(true)
    const correct_answer = parseEntities(answer)
    const choice = e.textContent
    if (choice === correct_answer && !answered) {
      e.classList.add(styles.correct)
      setAnswerCount(answerCount => answerCount + 1)
    } else if (choice !== correct_answer && !answered) {
      setNotes(notes => ([...notes, { correct_answer, question, choice }]))
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
      return `${Math.round(minutes)} 분 ${Math.round(remainingSeconds)} 초`
    } else {
      return `${Math.round(timeDiff)} 초`
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
            <button className={styles.quizButton} onClick={openQuiz} data-cy="start-quiz-btn">퀴즈 풀기</button>
          </>
        ) : (
          <>
            {loading ? (
              <p className={styles.loading}>Loading Questions...</p>
            ) : (
              <div className={styles.card} data-cy="quiz-card">
                {questionCount !== data.length && (
                  <p className={styles.questionCount}>Question: {questionCount + 1} / {data.length}</p>
                )}
                {data.slice(questionCount, questionCount + 1).map((d) => {
                  const question = d.question
                  const answer = d.correct_answer
                  return (
                    <div key={d.correct_answer}>
                      <p dangerouslySetInnerHTML={{ __html: d.question }} className={styles.question} />
                      {d.incorrect_answers.map((d: string) => (
                        <p key={d} dangerouslySetInnerHTML={{ __html: d }} className={styles.choice} onClick={(e) => handleClick(e.target, question, answer)} data-cy="quiz-choice" />
                      ))}
                    </div>
                  )
                })}
                {answered && (
                  <button className={styles.nextButton} onClick={showNextQuestion} data-cy="next-button">{questionCount === data.length - 1 ? '결과 보기' : '다음 문항'}</button>
                )}
                {questionCount === data.length && (
                  <div className={styles.results}>
                    <h2>결과 정보</h2>
                    <p className={styles.timePassed}>소요된 시간: {timePassed(new Date())}</p>
                    <p>정답 수: {answerCount}</p>
                    <p>오답 수: {data.length - answerCount}</p>
                    <div className={styles.graph}>
                      <div style={{ height: `${answerCount * 10}%` }}><span>정답 {answerCount * 10}%</span></div>
                      <div style={{ height: `${(data.length - answerCount) * 10}%` }}><span>오답 {(data.length - answerCount) * 10}%</span></div>
                    </div>
                    <button className={styles.restartButton} onClick={restartQuiz}>다시 풀기</button>
                    {showNotes ? (
                      <div className={styles.notesWrap}>
                        <h3>오답 노트</h3>
                        {notes.map(note => (
                          <div key={note.question} className={styles.note}>
                            <div>
                              <span>질문: </span>
                              <span dangerouslySetInnerHTML={{ __html: note.question }} />
                            </div>
                            <div>
                              <span>정답: </span>
                              <span dangerouslySetInnerHTML={{ __html: note.correct_answer }} />
                            </div>
                            <div>
                              <span>오답: </span>
                              <span dangerouslySetInnerHTML={{ __html: note.choice }} />
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <>
                        {notes.length > 0 && (
                          <button className={styles.notesButton} onClick={openNotes}>오답 노트 보기</button>
                        )}
                      </>
                    )}
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </main>
    </div>
  )
}

export default Quiz
