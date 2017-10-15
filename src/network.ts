export namespace Packets
{
    export function setContextUpdaters(socket, workflowId : string, taskPath : string, updaters)
    {
        socket.emit('setContextUpdaters', {
            workflowId,
            taskPath,
            updaters,
        });
    }
}