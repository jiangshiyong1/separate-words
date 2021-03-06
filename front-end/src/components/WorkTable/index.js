import * as React from "react";
import { connect } from "react-redux";
import store from '../../state/store'
import { Layout, message } from "antd";
import HeaderNav from './HeaderNav'
import { Route, Switch } from "react-router-dom";
import { refresh, getType } from '../../util' 
import Table_UI from './Table'
import CreateArticle_UI from './CreateArticle'
import ClassList_UI from './ClassList'
import axios from 'axios'

const { Header, Content } = Layout;

// 状态管理
let mapAllStateToProps = state => {
  return state
};

let mapStateToSeparateWordsProperty = state => {
  return {
    ...state,
    article: state.showArticle.separateWordsProperty
  }
}
let mapStateToSeparateWords = state => {
  return {
    ...state,
    article: state.showArticle.separateWords
  }
}
let mapStateToMarkEntity  = state => {
  return {
    ...state,
    article: state.showArticle.markEntity
  }
}

let mapStateToClassList = state => {
  return {
    ...state
  }
}

// 将 Table 组件公有的方法抽取出来
let mapDispathToTable = dispatch => {
  return {
    handleCancel: () => {
      dispatch({ type: 'CLOSE_MODAL' })
    },
    radioOnChange: (e) => {
      dispatch({
        type: 'SET_RADIO_VALUE',
        radioValue: e.target.value
      })
    },
    pageChange: async (page) => {
      dispatch({ type: "SET_PAGE", page })
      refresh(dispatch)
    }
  };
};
let mapDispathToSeparateWordsProperty = dispatch => {
  let publicDispathToTable = mapDispathToTable(dispatch)
  return {
    ...publicDispathToTable,
    handleOk: () => {
      let start = store.getState().selection.start
      let end = store.getState().selection.end
      let data = store.getState().showArticle.separateWordsProperty
      let type = store.getState().radioValue
      for (let i = start;i < end;i++) {
        data[i].type = type
      }
      if (data[start-1] && data[start-1].content != '|') {
        data.splice(start, 0, { id: null, content: '|', type: '0' })
        start ++
        end ++
      }
      if (data[end] && data[end].content != '|') {
        data.splice(end, 0, { id: 1, content: '|', type: '0' })
      }
      for (let i = end-1;i >= start;i--) {
        if (data[i] && data[i].content == '|') data.splice(i, 1)
      }
      dispatch({ type: 'CLOSE_MODAL' })
    },
    pickWords: () => {
      if (window.getSelection().toString()) {
        let start = window.getSelection().getRangeAt(0).startContainer.parentElement.id
        let end = + window.getSelection().getRangeAt(0).endContainer.parentElement.id + 1
        let selectedContent = ''
        let data = store.getState().showArticle.separateWordsProperty
        for (let i = start;i < end;i++) {
          selectedContent += data[i].content
        }
        if (selectedContent == '|') return
        dispatch({ 
          type: "SET_SELECTION", 
          selection: {
             content: selectedContent,
             start,
             end
          } 
        })
        dispatch({ type: "OPEN_MODAL"})
      }
    }
  };
};
let mapDispathToSeparateWords = dispatch => {
  let publicDispathToTable = mapDispathToTable(dispatch)
  return {
    ...publicDispathToTable,
    handleOk: () => {},
    pickWords: () => {
      if (window.getSelection().toString()) {
        let start = window.getSelection().getRangeAt(0).startContainer.parentElement.id
        let end = + window.getSelection().getRangeAt(0).endContainer.parentElement.id + 1
        let selectedContent = ''
        let data = store.getState().showArticle.separateWords
        for (let i = start;i < end;i++) {
          selectedContent += data[i].content
        }
        dispatch({ 
          type: "SET_SELECTION", 
          selection: {
             content: selectedContent,
             start,
             end
          }
        })
        if (selectedContent == '|') return
        let type = getType(data, store.getState().typeArr, start, end-1)
        let selection = store.getState().selection
        for (let i = selection.start;i < selection.end;i++) {
          data[i].type = type
        }
        if (data[start-1] && data[start-1].content != '|') {
          data.splice(start, 0, { id: null, content: '|', type: '0' })
          start ++
          end ++
        }
        if (data[end] && data[end].content != '|') {
          data.splice(end, 0, { id: 1, content: '|', type: '0' })
        }
        for (let i = end-1;i >= start;i--) {
          if (data[i] && data[i].content == '|') data.splice(i, 1)
        }
      }
    }
  };
};
let mapDispathToMarkEntity = dispatch => {
  let publicDispathToTable = mapDispathToTable(dispatch)
  return {
    ...publicDispathToTable,
    handleOk: () => {},
    pickWords: () => {
      if (window.getSelection().toString()) {
        let start = window.getSelection().getRangeAt(0).startContainer.parentElement.id
        let end = + window.getSelection().getRangeAt(0).endContainer.parentElement.id + 1
        let selectedContent = ''
        let data = store.getState().showArticle.markEntity
        for (let i = start;i < end;i++) {
          selectedContent += data[i].content
        }
        dispatch({ 
          type: "SET_SELECTION", 
          selection: {
             content: selectedContent,
             start,
             end
          }
        })
        if (selectedContent == '|') return
        let type = getType(data, store.getState().typeArr, start, end-1)
        let selection = store.getState().selection
        for (let i = selection.start;i < selection.end;i++) {
          data[i].type = type
        }
        if (data[start-1] && data[start-1].content != '|') {
          data.splice(start, 0, { id: null, content: '|', type: '0' })
          start ++
          end ++
        }
        if (data[end] && data[end].content != '|') {
          data.splice(end, 0, { id: 1, content: '|', type: '0' })
        }
        for (let i = end-1;i >= start;i--) {
          if (data[i] && data[i].content == '|') data.splice(i, 1)
        }
      }
    }
  };
};

let mapDispathToCreateArticle = dispatch => {
  return {
    create: async () => {
      let state = store.getState()
      let content = state.createArticle.replace('\n', '').replace(/\s+/g, '')
      let title = state.createArticleTitle
      if (content == '' || title == '') return message.error('标题和内容不能为空！')
      let tips = message.loading('Creating...')
      let separateWords = '', separateWordsProperty = '', markEntity = ''
      for (let i = 0;i < content.length;i++) {
        separateWords += 'S'
        markEntity += 'S'
        separateWordsProperty += 'S0'
      }
      let article = {
        title,
        content,
        separateWords,
        markEntity,
        separateWordsProperty
      }
      let res = await axios.post(`${state.path}/api/article`, article)
      message.destroy(tips)
      if (res.data.code == 0) {
        dispatch({ type: "SET_CREATE_ARTICLE", createArticle: '' })
        dispatch({ type: "SET_CREATE_ARTICLE_TITLE", createArticleTitle: '' })
        dispatch({ type: "SET_PAGE", page: 1 })
        message.success('Create Successed!', 1.5)
        refresh(dispatch)
      } else {
        message.error('Create defeat!', 1.5)
      }
    },
    cancel: () => {
      dispatch({ type: "SET_CREATE_ARTICLE", createArticle: '' })
      dispatch({ type: "SET_CREATE_ARTICLE_TITLE", createArticleTitle: '' })
    },
    contentChange: e => {
      dispatch({ type: "SET_CREATE_ARTICLE", createArticle: e.target.value })
    },
    titleChange: e => {
      dispatch({ type: "SET_CREATE_ARTICLE_TITLE", createArticleTitle: e.target.value })
    }
  }
}
let mapDispatchToApp = dispatch => {
  return {
    refresh: () => refresh(dispatch)
  }
}

let SeparateWordsProperty = connect(mapStateToSeparateWordsProperty, mapDispathToSeparateWordsProperty)(Table_UI)
let SeparateWords = connect(mapStateToSeparateWords, mapDispathToSeparateWords)(Table_UI)
let MarkEntity = connect(mapStateToMarkEntity, mapDispathToMarkEntity)(Table_UI)
let CreateArticle = connect(mapAllStateToProps, mapDispathToCreateArticle)(CreateArticle_UI)
let ClassList = connect(mapStateToClassList)(ClassList_UI)

class App extends React.Component {
  componentWillMount () {
    let { refresh } = this.props
    refresh()
  }
  render() {
    return (
      <Layout style={{ minHeight: '100vh' }}>
        <Header>
          <HeaderNav></HeaderNav>
        </Header>
        <Content>
          <Layout style={{ minHeight: '90vh' }}>
            <Layout>
              <Switch>
                <Route path='/WorkTable/separate-words' component={ SeparateWords }></Route>
                <Route path='/WorkTable/mark-entity' component={ MarkEntity }></Route>
                <Route path='/WorkTable/separate-words-property' component={ SeparateWordsProperty }></Route>
                <Route path='/WorkTable/class-list' component={ ClassList }></Route>
                <Route path='/WorkTable/create-article' component={ CreateArticle }></Route>
              </Switch>
            </Layout>
          </Layout>
        </Content>
      </Layout>
    );
  }
}

export default connect(null, mapDispatchToApp)(App) 