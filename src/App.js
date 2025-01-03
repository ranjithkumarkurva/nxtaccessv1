import {BrowserRouter, Route, Switch, Redirect} from 'react-router-dom'
import Cookies from 'js-cookie'

import Login from './components/Login'
import Header from './components/HeaderRouter'
import Home from './components/Home'
import Assessment from './components/AssessmentRouter'
import ResultPage from './components/SuccessResults'
import NotFound from './components/NotFound'

import './App.css'

const ProtectedRoute = props => {
  const token = Cookies.get('jwt_token')
  if (token === undefined) {
    return <Redirect to="/login" />
  }
  return <Route {...props} />
}

const App = () => (
  <BrowserRouter>
    <div className="app-container">
      <Switch>
        <Route exact path="/login" component={Login} />
        <ProtectedRoute exact path="/" component={Home} />
        <ProtectedRoute
          exact
          path="/assessment"
          render={props => (
            <>
              <Header {...props} />
              <Assessment {...props} />
            </>
          )}
        />
        <ProtectedRoute
          exact
          path="/results"
          render={props => (
            <>
              <Header {...props} />
              <ResultPage {...props} />
            </>
          )}
        />
        <Route path="/not-found" component={NotFound} />
        <Redirect to="not-found" />
      </Switch>
    </div>
  </BrowserRouter>
)

export default App
