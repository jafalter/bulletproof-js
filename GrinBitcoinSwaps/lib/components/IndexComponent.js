import React from "react";
import { Text } from 'react-native';
import Factory from "../service/Factory";
import EnterNewPasswordComp from "./subcomponents/EnterNewPasswordComp";

const logger = Factory.getLogger();

class IndexComponent extends React.Component {

    constructor(props) {
        super(props);
        this.passDao = Factory.getPasswordDao();
        this.state = {
            status: 'initializing'
        }
    }

    async componentDidMount() {
        try {
            const pass = await this.passDao.getPasswordChecksum();
            logger.info(pass);
            const setupNeeded = pass === null;
            if( setupNeeded ) {
                this.setState({
                    status : 'setup'
                });
            }
            else {
                this.setState({
                    status : 'ready'
                })
            }
        } catch (e) {
            logger.error("Error during db query", e);
            this.setState({
                status: 'corrupted'
            });
        }
    }

    render() {
        let msg = "initializing";

        switch (this.state.status) {
            case 'initializing':
                msg = 'initializing';
                break;
            case 'corrupted':
            default:
                msg = 'corrupted';
                break;
            case 'ready':
                msg = 'ready';
                break;
            case 'setup':
                return <EnterNewPasswordComp/>
        }

        return <Text>{msg}</Text>
    }
}

export default IndexComponent;