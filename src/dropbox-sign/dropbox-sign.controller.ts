import {
  Controller,
  Post,
  Body,
  Get,
  Req,
  Request,
  ValidationPipe,
  UsePipes,
  Response,
  UseInterceptors,
} from '@nestjs/common';
import {
  EmbeddedApi,
  SignatureRequestApi,
  SubSigningOptions,
} from '@dropbox/sign';
import { ConfigService } from '@nestjs/config';
import { DropboxSignService, SignatureService } from './dropbox-sign.service';
import { AnyFilesInterceptor } from '@nestjs/platform-express';

@Controller()
export class DropboxSignController {
  constructor(
    private readonly configService: ConfigService, // Access env var
    private readonly dropboxSignService: DropboxSignService, // database operations service
    private readonly signatureService: SignatureService, //for storing and retriving the sigtnature Id
  ) {}

  @Get('/')
  async testRoute(): Promise<any> {
    return { message: 'Server is Up and Running.', timestamp: new Date() };
  }

  @Post('/oauth')
  @UseInterceptors(AnyFilesInterceptor())
  async oauth(@Request() req, @Response() res) {
    try {
      const webhookBody = req.body;
      const jsonString = webhookBody?.json;
      if (!jsonString) {
        throw new Error('No JSON payload found in the webhook body');
      }
      const parsedJson = JSON.parse(jsonString);
      const eventType = parsedJson?.event?.event_type;
      console.log('Received webhook event:', eventType);
      return res.status(200).send('Hello API event received');
    } catch (error) {
      //   console.error('Error processing the webhook:', error);
      throw new Error('Invalid webhook data');
    }
  }

  @Post('/sign')
  async signDoc(@Request() req): Promise<any> {
    try {
      const { role, name, emailAddress, templateId } = req.body;
      if (!role || !name || !emailAddress || !templateId) {
        throw new Error('Invalid request body: Missing required fields');
      }

      const dropbox = new SignatureRequestApi();
      dropbox.username = this.configService.get('DROPBOX_SIGN_API_KEY');

      const signers = [
        {
          role: role,
          name: name,
          emailAddress: emailAddress,
        },
      ];

      const resp = await dropbox.signatureRequestCreateEmbeddedWithTemplate({
        templateIds: [templateId],
        clientId: this.configService.get('DROPBOX_SIGN_CLIENT_ID'),
        subject: 'Purchase Agreement',
        message: 'Please Read and Sign this Rooftop Air Right Agreement',
        signers: signers,
        customFields: [
          {
            name: 'amount',
            value: '40 $',
          },
        ],
        signingOptions: {
          draw: true,
          type: true,
          upload: true,
          defaultType: SubSigningOptions.DefaultTypeEnum.Draw,
        },
        testMode: true,
      });

      const signatureId =
        resp.body.signatureRequest?.signatures[0]?.signatureId;

      const signatureRequest = resp.body.signatureRequest;

      // extracting the required details
      const title = signatureRequest?.title;
      const message = signatureRequest?.message;
      const requesterEmailAddress = signatureRequest?.requesterEmailAddress;

      this.signatureService.setSignatureId(signatureId);

      try {
        await this.dropboxSignService.saveSignerData({
          role,
          name,
          emailAddress,
          templateId,
        });
      } catch (error) {
        // console.error('Error saving signer data:', error.message);
        throw new Error('Failed to save signer data');
      }

      return {
        message: 'Document sent for signing',
        signerData: {
          title,
          message,
          requesterEmailAddress,
        },
      };

      // const embeddedApi = new EmbeddedApi();
      // embeddedApi.username = this.configService.get('DROPBOX_SIGN_API_KEY');

      // const embeddedResp = await embeddedApi.embeddedSignUrl(signatureId);
      // return {
      //   message: 'Document sent for signing',
      //   embeddedUrl: embeddedResp.body.embedded?.signUrl,
      //   expiresAt: embeddedResp.body.embedded?.expiresAt,
      // };
    } catch (error) {
      // console.error(
      //   'Error processing the sign request:',
      //   error?.response?.data,
      // );
      throw new Error('Invalid sign request data');
    }
  }

  @Get('/embedded-url')
  async embeddedURl(@Request() req): Promise<any> {
    try {
      const signatureId = this.signatureService.getSignatureId();

      const embeddedApi = new EmbeddedApi();
      embeddedApi.username = this.configService.get('DROPBOX_SIGN_API_KEY');

      const resp = await embeddedApi.embeddedSignUrl(signatureId);

      return {
        embeddedUrl: resp.body.embedded?.signUrl,
        expiresAt: resp.body.embedded?.expiresAt,
      };
    } catch (error) {
      // console.log(error);
      throw error;
    }
  }
}
