import { AbstractComponent } from '../../shared/abstract'
import { CardComponent, LogoComponent, LoadingComponent, GameCardLoadComponent } from '../../shared/components'
import { checkMail } from '../../utils'
import { withAxiosPrivate, withRouter } from '../../hooks'
import type { VerifyMailProps, VerifyMailState } from './types';

import './verify-mail.component.scss'

class VerifyMailComponent extends AbstractComponent<VerifyMailProps, VerifyMailState> {
  constructor(props: VerifyMailProps) {
    super(props);
    this.state =
    {
      matches: false,
      email: "",
      loaded: false,
      error: undefined,
      loading: true
    }
  }

  componentDidMount() {

    this.props.axios.get(`/verify/check`)
      .then((res: any) => {
    	  this.setState({loading: false});
          switch (res.data.verified) {
            case 1:
              this.props.router.navigate('/verify');
              break;
            case 2:
              this.setState({loaded: true});
              break;
            default:
              this.props.router.navigate('/dashboard');
          }
      }).catch((err: any) => {
		    console.log("Unexpected /verify/check error");
	    });
  }

  onSubmit = () => {
    this.setState({error: undefined})

    const data = {
      email: this.state.email
    }

    this.props.axios.post(`/email/change`, data)
      .then((res: any) => {
    	  this.props.router.navigate('/verify');
      }).catch((err: any) => {
		  if(err.response)
    		this.setState({error: err.response.data.error})
	    });
  }

  setEmail = (self: VerifyMailComponent, email: string) => {
    const matches = !checkMail(email);
    self.setState({email: email, matches: matches});
  }

  render() {
    return (
      <div>
        <LoadingComponent loading={this.state.loading} />
        <CardComponent styleClassName="verifymail">

          <LogoComponent className="logo" />

          {this.state.loaded === true ?
            <div className="input_wrapper">

              {
                this.state.error !== undefined &&
                <p className="error">{this.state.error}</p>
              }

              <input
                type="text"
                className={"text_input " + (this.state.matches === false ? "invalid" : "")}
                name="email"
                placeholder="E-Mail"
                value={this.state.email}
                onChange={(e) => this.setEmail(this, e.target.value)}
              />

              <input
                className="button_input"
                onClick={this.onSubmit}
                type="submit"
                name="submit"
                value="Verify"
                disabled={!this.state.matches}
              />
            </div>
            :
            <GameCardLoadComponent size={1} />
          }

        </CardComponent>
      </div>
    )
  }
}

export default withAxiosPrivate(withRouter(VerifyMailComponent));
