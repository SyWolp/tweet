import { useEffect, useState } from 'react';
import { API, graphqlOperation } from 'aws-amplify';
import { listTweets } from './graphql/queries';
import {createTweet} from './graphql/mutations';
import { onCreateTweet } from "./graphql/subscriptions";

let App = () => {
  const [formData, setFormData] = useState({
    author: "",
    text: "",
  });
  const onChange = (event) => {
    const {
      target: {name, value},
    } = event;
    setFormData((prev)=>({...prev, [name]: value})
    );
  }
  const [tweets, setTweets] = useState([]);
  console.log(tweets.map((tewet)=>{ return tewet.author}));
  const fetchTweets = async () => {
    const request = await API.graphql(graphqlOperation(listTweets));
    setTweets(request.data.listTweets.items);
  };

  const realtimeTweets = () => {
    API.graphql(graphqlOperation(onCreateTweet)).subscribe({
      next: ({value: {data}}) =>
      setTweets((prev) => [{...data.onCreateTweet}, ...prev]),
    });
  };

  useEffect(()=>{
    realtimeTweets();
    fetchTweets();
  },[]);
  const onSubmit = async (event) => {
    event.preventDefault();
    await API.graphql(graphqlOperation(createTweet, {input: formData}));
    setFormData((prev) => ({...prev, text: ""}));
  };
  return (
    <main className="container">
      <h1>Hello</h1>
      <section>
        <h3>Hello Dev</h3>
        <form onSubmit={onSubmit}>
          <input type="text" name="author" placeholder="이름을 입력하세요" required onChange={onChange} value={formData.author}></input>
          <textarea onChange={onChange} value={formData.text} name="text" required placeholder="기분이 어때요?" ></textarea>
          <button>등록</button>
        </form>
      </section>
      <hr />
      <section>
        <h2>기분들</h2>
        <div>
          {tweets.map((tweet)=>{
            return(
              <article key={tweet.id}>
                <hgroup>
                  <h4>{tweet.text}</h4>
                  <h5>{tweet.author}</h5>
                </hgroup>
              </article>
            )
          })}
        </div>
      </section>
    </main>
  )
}

export default App;