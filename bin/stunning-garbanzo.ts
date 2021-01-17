#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';
import { StunningGarbanzoStack } from '../lib/stunning-garbanzo-stack';

const app = new cdk.App();
new StunningGarbanzoStack(app, 'StunningGarbanzoStack');
