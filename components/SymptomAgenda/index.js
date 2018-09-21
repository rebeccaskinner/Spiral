import React from 'react';
import { FlatList, View } from 'react-native';
import { Agenda } from 'react-native-calendars';
import { xdateToData } from 'react-native-calendars/src/interface';
import { dateToData } from '../../lib/common';
import { ListItem, Body, Card, CardItem, Text, variables } from 'native-base';
import { observable } from 'mobx';
import { observer } from 'mobx-react/native';
import moment from 'moment';
import { set } from 'lodash';

function HourText ({ hour, isNow, ...props }) {
  let ampm = 'am';
  hour = Number(hour);
  if (hour > 11) {
    ampm = 'pm';
    hour -= 12;
  }
  if (hour === 0) {
    hour = 12;
  }
  const text = `${hour}:00${ampm}`;
  const styles = {
    alignSelf: 'center',
    justifyContent: 'flex-end',
    flexDirection: 'row',
    width: 60,
  };
  const textStyle = {
    color: isNow ? variables.brandPrimary : '#a7a7a7',
    fontSize: variables.noteFontSize,
  };
  return <View style={styles}><Text style={textStyle} {...props}>{text}</Text></View>;
}

@observer
class SymptomAgenda extends Agenda {

  constructor (props) {
    super(props);
    this.monthsNeeded = observable.array();
  }

  renderReservations () {
    const nowIndex = Math.min(15, (new Date).getHours());
    return (
      <FlatList
        ref={(el) => (this.list = el)}
        onLayout={() => { this.list.scrollToIndex({ index: nowIndex, animated: false }); }}
        data={this.generateHours()}
        extraData={this.state.selectedDay}
        renderItem={this.renderHour}
        style={{ backgroundColor: '#FFF' }}
        contentOffset={{ x: 0, y: 43.5 * nowIndex }}
        ListFooterComponent={() => <View style={{ height: 50 }} />}
        onScrollToIndexFailed={(info) => {
          this.list.scrollToOffset({ offset: info.averageItemLength * info.index, animated: false });
        }}
      />
    );
  };

  renderHour = ({ item, ...props }) => (
    <ListItem {...props} key={item.key} onPress={() => { if (this.props.onHourSelected) this.props.onHourSelected(item.targetHour); }}>
      <HourText hour={item.hour} isNow={item.isNow} />
      <Body>
        {item.hasRecords && <Card>
          <CardItem>

          </CardItem>
        </Card>}
      </Body>
    </ListItem>
  );


  generateHours = () => {
    const selected = xdateToData(this.state.selectedDay);
    const today = dateToData(new Date);
    const { year, month, day } = selected;
    const isToday = today.year === year && today.month === month && today.day === day;
    const nowHour = moment().hour();
    // console.log({ selected, today, isToday });
    const hours = [];
    for (let hour = 0; hour < 24; hour++) {
      const hourState = this.props.calendarStore.getHour(year, month, day, hour);
      hours.push({
        key: [ year, month, day, hour ].join('-'),
        isNow: isToday && nowHour === hour,
        targetHour: { year, month, day, hour },
        hour,
        hasRecords: hourState && hourState.hasData,
        state: hourState,
      });
    }
    return hours;
  }

  generateMarkings = () => {
    const selected = xdateToData(this.state.selectedDay);
    const selectedDayKey = selected.dateString;
    const marks = this.monthsNeeded.reduce((results, m) => {
      const { year, month } = m;
      const daysInMonth = moment([ year, month - 1, 1 ]).endOf('month').date();
      for (let day = 1; day <= daysInMonth; day++) {
        const dayKey = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        const record = this.props.calendarStore.getDay(year, month, day);
        const hasRecords = record && record.hasData;
        const isSelected = dayKey === selectedDayKey;
        if (hasRecords || isSelected) {
          results[dayKey] = {
            marked: hasRecords,
            selected: isSelected,
          };
        }
      }
      return results;
    }, {});

    set(marks, [ selectedDayKey, 'selected' ], true);

    return marks;
  }

  onVisibleMonthsChange (months) {
    months.forEach(({ year, month }) => {
      this.props.calendarStore.ensureMonthLoaded(year, month);
    });
    this.monthsNeeded.replace(months);
  }

}

export default SymptomAgenda;
