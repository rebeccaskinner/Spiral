import { NavigationActions } from 'react-navigation';

let _navigator;

function setTopLevelNavigator (navigatorRef) {
  _navigator = navigatorRef;
}

function navigate (routeName, params) {
  _navigator.dispatch(
    NavigationActions.navigate({
      routeName,
      params,
    })
  );
}

navigate.setTopLevelNavigator = setTopLevelNavigator;

export default navigate;

// import { dateToData } from './common';
// setTimeout(() => { navigate('CalendarEntry', { hour: dateToData(new Date()) }); }, 500);
