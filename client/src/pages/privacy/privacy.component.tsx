import { AbstractComponent } from '../../shared/abstract'
import { FoldableComponent, ScrollbarComponent } from '../../shared/components'

import './privacy.component.scss'

class PrivacyComponent extends AbstractComponent {

  render() {
    return (
      <div className="privacy_wrapper">
        <h1 className="privacy_title">Privacy</h1>
        <ScrollbarComponent>
          <FoldableComponent
              title="Data collection and usage"
              styleClassName={''}
            >
            <p className="content">
              We collect store and process the username, password and email you enter at the register page when creating an account.<br />
              <br />
            The email is used to verify the account, you will only recieve absolutely necessary mails.<br />
            We require an email to hinder people from creating too many accounts.<br />
              <br />
            Sensitive information like the email password is kept in the system and not shared with others.<br />
            Other information like the username or the collected gameplay data may be shared with other users.<br />
              <br />
            The Information is kept in the system until no longer necessary, but can be removed on user demand.<br />
              <br />
            Our servers are located in Italy, so be aware that your data may be transferred, stored and processed in Italy.<br />
            </p>

          </FoldableComponent>

          <FoldableComponent
              title="Cookies"
              styleClassName={''}
            >
            <p className="content">
              The only cookies we collect use and store are ours.<br />
            In them we store a token which will automatically log you into your account.<br />
            Because of that the cookies should not be shared with others.<br />
            </p>
          </FoldableComponent>

          <FoldableComponent
              title="Age"
              styleClassName={''}
            >
            <p className="content">
              We do not knowingly collect data from children under 13 years of age.<br />
            By using this site you confirm that you are older than 13 years of age.<br />
            </p>
          </FoldableComponent>

          <FoldableComponent
              title="Updates"
              styleClassName={''}
            >
            <p className="content">
              The privacy policy may be changed in the future to stay compliant with laws and inform you in case any other data will be processed in the future.<br />
			Therefore we recommend you to review this privacy policy frequently<br />
            </p>
          </FoldableComponent>

          <FoldableComponent
              title="Your Privacy Rights"
              styleClassName={''}
            >
            <p className="content">
              In case you want to review, change, or delete your data stored and processed by us you can contact us.<br />
            </p>
          </FoldableComponent>

          <FoldableComponent
              title="Contact"
              styleClassName={''}
            >
            <p className="content">
              Email: contact.waifucollector@gmail.com<br />
            Discord-Server: <a href="https://discord.gg/hftNUqNgRj" rel="noreferrer" target="_blank">https://discord.gg/hftNUqNgRj</a><br />
            WaifuCollector<br />
            Hollechn 5<br />
            39030 St.Peter<br />
            Italy<br />
            </p>
          </FoldableComponent>
        </ScrollbarComponent>
      </div>
    )
  }
}

export default PrivacyComponent;
