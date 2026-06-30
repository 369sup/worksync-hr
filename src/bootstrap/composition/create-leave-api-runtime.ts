import { ActorContextFactory } from "@/bootstrap/auth/actor-context-factory";
import { createFirebaseAdminAuth } from "@/bootstrap/auth/firebase-admin";
import { FirebaseAuthenticationAdapter } from "@/bootstrap/auth/firebase-authentication-adapter";
import { FirestoreMembershipQueryAdapter } from "@/bootstrap/auth/firestore-membership-query-adapter";
import { readServerEnvironment } from "@/bootstrap/env/env";
import { createFirestoreDatabase } from "@/bootstrap/persistence/firestore";
import {
  FirestoreEmployeeSnapshotQueryAdapter,
  FirestoreLeaveAccessQueryAdapter,
  FirestoreLeaveTypeSnapshotQueryAdapter,
  FirestoreWorkScheduleSnapshotQueryAdapter,
} from "@/modules/leave/adapters/external-systems/firestore-leave-query-adapters";
import { FirestoreLeaveRequestRepository } from "@/modules/leave/adapters/repositories/firestore-leave-request-repository";
import { FirestoreAuditAdapter } from "@/modules/leave/adapters/audit/firestore-audit-adapter";
import { DefaultLeaveEligibilityPolicy } from "@/modules/leave/domain/policies/leave-eligibility-policy";
import { ApproveLeaveRequestUseCase } from "@/modules/leave/application/use-cases/approve-leave-request";
import { CancelLeaveRequestUseCase } from "@/modules/leave/application/use-cases/cancel-leave-request";
import { GetLeaveRequestDetailUseCase } from "@/modules/leave/application/use-cases/get-leave-request-detail";
import { RejectLeaveRequestUseCase } from "@/modules/leave/application/use-cases/reject-leave-request";
import { SearchLeaveRequestsUseCase } from "@/modules/leave/application/use-cases/search-leave-requests";
import { SubmitLeaveRequestUseCase } from "@/modules/leave/application/use-cases/submit-leave-request";
import { systemClock } from "@/shared/kernel/clock";
import { cryptoIdentifierGenerator } from "@/bootstrap/identifiers/crypto-identifier-generator";

export function createLeaveApiRuntime() {
  const environment = readServerEnvironment();
  const persistence = createFirestoreDatabase(environment);
  const repository = new FirestoreLeaveRequestRepository(persistence.database);
  const employees = new FirestoreEmployeeSnapshotQueryAdapter(
    persistence.database,
  );
  const workSchedules = new FirestoreWorkScheduleSnapshotQueryAdapter(
    persistence.database,
  );
  const leaveTypes = new FirestoreLeaveTypeSnapshotQueryAdapter(
    persistence.database,
  );
  const access = new FirestoreLeaveAccessQueryAdapter(persistence.database);
  const audit = new FirestoreAuditAdapter(persistence.database);
  const authentication = new FirebaseAuthenticationAdapter(
    createFirebaseAdminAuth(environment),
    environment.firebase,
  );
  const actors = new ActorContextFactory(
    new FirestoreMembershipQueryAdapter(persistence.database),
  );

  return {
    authentication,
    actors,
    audit,
    submit: new SubmitLeaveRequestUseCase(
      repository,
      employees,
      workSchedules,
      leaveTypes,
      new DefaultLeaveEligibilityPolicy(),
      cryptoIdentifierGenerator,
      systemClock,
      repository,
    ),
    approve: new ApproveLeaveRequestUseCase(
      repository,
      access,
      repository,
      systemClock,
    ),
    reject: new RejectLeaveRequestUseCase(
      repository,
      access,
      repository,
      systemClock,
    ),
    cancel: new CancelLeaveRequestUseCase(repository, repository, systemClock),
    getDetail: new GetLeaveRequestDetailUseCase(
      repository,
      access,
      systemClock,
      audit,
    ),
    search: new SearchLeaveRequestsUseCase(repository, access, systemClock),
    close: persistence.close,
  };
}

export type LeaveApiRuntime = ReturnType<typeof createLeaveApiRuntime>;
