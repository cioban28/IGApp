import { observable, action, decorate } from 'mobx';

class UserStore {
    userAccount = null;
    userMonthPlan = null;

    setUserAccount(data) {
        this.userAccount = data;
    }

    setUserMonthPlan(data) {
        this.userMonthPlan = data;
    }
}
decorate(UserStore, {
    userAccount: observable.ref,
    userMonthPlan: observable.ref,
    setUserAccount: action,
    setUserMonthPlan: action
});

export default new UserStore();
