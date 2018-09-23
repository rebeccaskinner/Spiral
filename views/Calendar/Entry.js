import React from 'react';
import { StyleSheet, View } from 'react-native';
import { computed, observable } from 'mobx';
import { observer } from 'mobx-react/native';
import { withMappedNavigationProps } from 'react-navigation-props-mapper';
import Arcs from '../../components/MBPallet/Arcs';
import MoodMenu from '../../components/MBPallet/MoodMenu';

import {
  MB_MOODS,
} from '../../constants';


@observer
class EntryView extends React.Component {

  constructor (props) {
    super(props);

    const currentHour = props.navigation.getParam('hour');
    const { year, month, day, hour } = currentHour;

    this.state = {
      currentTab: null,
      currentHour,
      entry: props.calendarStore.getHour(year, month, day, hour, true),
    };

  }

  onTabSwitch = (tab) => {
    this.setState({ currentTab: tab });
  };

  onToggleEmotion = (emotionKey, selected) => {
    this.state.entry.setEmotion(emotionKey, selected);
  };

  render () {
    const tabName = this.state.currentTab;
    let tabbedComponent = null;

    switch (tabName) {
    case 'Anger':
    case 'Anxiety':
    case 'Joy':
    case 'Sadness':
      tabbedComponent = (
        <MoodMenu
          entryEmotions={this.state.entry.emotions}
          mood={MB_MOODS[tabName]}
          onToggleEmotion={this.onToggleEmotion}
        />
      );
      break;

    default:
      tabbedComponent = null;
    }

    return (
      <View style={styles.container}>
        {tabbedComponent}
        <Arcs onTabSwitch={this.onTabSwitch} />
      </View>
    );
  }
}

export default (EntryView);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    justifyContent: 'flex-end',
    backgroundColor: '#111',
  },
});
