import {Controller, Get, Logger, Req, Response} from '@nestjs/common';
import {sendResponse} from "../helper/util";

@Controller()
export class ReadyController {
    private readonly logger = new Logger(ReadyController.name);

    @Get('/ready')
    async ready(@Req() req, @Response() res) {
        sendResponse(res, 'Ready.');
    }
}
