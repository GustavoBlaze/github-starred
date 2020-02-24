import React, { Component } from 'react';
import { ActivityIndicator } from 'react-native';
import PropTypes from 'prop-types';
import api from '../../services/api';
import {
  Container,
  Header,
  Avatar,
  Name,
  Bio,
  Stars,
  Starred,
  OwnerAvatar,
  Info,
  Title,
  Author,
} from './styles';

export default class User extends Component {
  static navigationOptions = ({ navigation }) => ({
    title: navigation.getParam('user').name,
  });

  state = {
    stars: [],
    loading: false,
    loadingMore: false,
    refreshing: false,
    page: 1,
  };

  async componentDidMount() {
    const { navigation } = this.props;
    const user = navigation.getParam('user');

    this.setState({ loading: true });
    const response = await api.get(`/users/${user.login}/starred`);
    this.setState({ stars: response.data, loading: false });
  }

  refreshList = async () => {
    const { navigation } = this.props;
    const user = navigation.getParam('user');

    this.setState({ refreshing: true });
    const response = await api.get(`/users/${user.login}/starred`);
    this.setState({ stars: response.data, refreshing: false });
  };

  loadMore = async () => {
    const { navigation } = this.props;
    const { page, stars, loadingMore } = this.state;
    const user = navigation.getParam('user');

    if (loadingMore) return;

    this.setState({ loadingMore: true });

    const { data } = await api.get(
      `/users/${user.login}/starred?page=${page + 1}`
    );

    if (data.length > 0) {
      this.setState({
        loadingMore: false,
        page: page + 1,
        stars: [...stars, ...data],
      });
    } else {
      this.setState({
        loadingMore: false,
      });
    }
  };

  handleNavigate = repo => {
    const { navigation } = this.props;

    navigation.navigate('Repository', { repo });
  };

  render() {
    const { stars, loading, loadingMore, refreshing } = this.state;
    const { navigation } = this.props;
    const user = navigation.getParam('user');

    return (
      <Container>
        <Header>
          <Avatar source={{ uri: user.avatar }} />
          <Name>{user.name}</Name>
          <Bio>{user.bio}</Bio>
        </Header>

        {loading ? (
          <ActivityIndicator
            color="#7159c1"
            size={35}
            style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}
          />
        ) : (
          <Stars
            data={stars}
            keyExtractor={star => String(star.id)}
            onEndReachedThreshold={0.2}
            onEndReached={this.loadMore}
            onRefresh={this.refreshList}
            refreshing={refreshing}
            renderItem={({ item }) => (
              <Starred onPress={() => this.handleNavigate(item)}>
                <OwnerAvatar source={{ uri: item.owner.avatar_url }} />
                <Info>
                  <Title>{item.name}</Title>
                  <Author>{item.owner.login}</Author>
                </Info>
              </Starred>
            )}
          />
        )}
        {loadingMore && (
          <ActivityIndicator color="#7159c1" style={{ marginBottom: -15 }} />
        )}
      </Container>
    );
  }
}

User.propTypes = {
  navigation: PropTypes.shape({
    getParam: PropTypes.func,
    navigate: PropTypes.func,
  }).isRequired,
};
