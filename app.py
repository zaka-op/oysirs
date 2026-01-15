#!/usr/bin/env python3
import os

import aws_cdk as cdk

from oysirs.oysirs_stack import OysirsStack


app = cdk.App()
OysirsStack(
    app, "OysirsStack",
    env=cdk.Environment(account='918075022066', region='af-south-1'),

    # For more information, see https://docs.aws.amazon.com/cdk/latest/guide/environments.html
)

app.synth()
